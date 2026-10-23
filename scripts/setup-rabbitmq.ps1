
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:15672/api"


# Carrega a URL do RabbitMQ a partir do .env local
$envPath = Join-Path $PSScriptRoot "..\.env"

$linhaRabbitMQ = Get-Content $envPath |
    Where-Object { $_ -match '^RABBITMQ_URL=' } |
    Select-Object -First 1

if (-not $linhaRabbitMQ) {
    throw "RABBITMQ_URL nao encontrada no arquivo .env"
}

$rabbitmqUrl = (
    $linhaRabbitMQ -replace '^RABBITMQ_URL=', ''
).Trim().Trim('"').Trim("'")

$uri = [Uri]$rabbitmqUrl
$usuario, $senha = $uri.UserInfo -split ':', 2

if (-not $usuario -or -not $senha) {
    throw "Credenciais RabbitMQ invalidas no arquivo .env"
}

$credenciais = [Convert]::ToBase64String(
    [Text.Encoding]::UTF8.GetBytes(
        "${usuario}:${senha}"
    )
)


$headers = @{
    Authorization = "Basic $credenciais"
}

function Enviar-Configuracao {
    param(
        [string]$Caminho,
        [hashtable]$Dados,
        [string]$Metodo = "PUT"
    )

    $body = $Dados | ConvertTo-Json -Depth 10

    Invoke-RestMethod `
        -Uri "$baseUrl/$Caminho" `
        -Method $Metodo `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $body | Out-Null
}

# Exchange para mensagens rejeitadas
Enviar-Configuracao `
    -Caminho "exchanges/%2F/notifications_dlx" `
    -Dados @{
        type = "direct"
        durable = $true
        auto_delete = $false
        internal = $false
        arguments = @{}
    }

# Dead Letter Queue
Enviar-Configuracao `
    -Caminho "queues/%2F/notifications_dlq" `
    -Dados @{
        durable = $true
        auto_delete = $false
        arguments = @{}
    }


# Binding entre exchange e DLQ
$bindings = @(
    Invoke-RestMethod `
        -Uri "$baseUrl/bindings/%2F/e/notifications_dlx/q/notifications_dlq" `
        -Method GET `
        -Headers $headers
)

$bindingExiste = @(
    $bindings | Where-Object {
        $_.routing_key -eq "notifications.failed"
    }
).Count -gt 0

if (-not $bindingExiste) {
    Enviar-Configuracao `
        -Caminho "bindings/%2F/e/notifications_dlx/q/notifications_dlq" `
        -Metodo "POST" `
        -Dados @{
            routing_key = "notifications.failed"
            arguments = @{}
        }

    Write-Host "Binding da DLQ criado."
} else {
    Write-Host "Binding da DLQ ja existe."
}


# Policy aplicada à fila principal
Enviar-Configuracao `
    -Caminho "policies/%2F/notifications-dlq-policy" `
    -Dados @{
        pattern = "^notifications_queue$"
        "apply-to" = "queues"
        priority = 1
        definition = @{
            "dead-letter-exchange" = "notifications_dlx"
            "dead-letter-routing-key" = "notifications.failed"
        }
    }

Write-Host "Configuracao RabbitMQ/DLQ concluida com sucesso."
