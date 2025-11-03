# Script simple pour fixer l'ordre des paths dans swagger.json
# Authentication en premier

$swaggerJsonPath = "docs\swagger.json"

if (-not (Test-Path $swaggerJsonPath)) {
    Write-Host "Erreur: swagger.json non trouve" -ForegroundColor Red
    exit 1
}

Write-Host "Reorganisation des paths Swagger..." -ForegroundColor Yellow
$jsonContent = Get-Content $swaggerJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

# Ajouter le champ tags avec l'ordre souhaite
$tagsArray = @(
    @{ name = "Authentication"; description = "Endpoints d authentification" },
    @{ name = "Products"; description = "Gestion des produits de soins" },
    @{ name = "Orders"; description = "Gestion des commandes" },
    @{ name = "Categories"; description = "Gestion des categories de produits" },
    @{ name = "Users"; description = "Gestion des utilisateurs" }
)
$jsonContent | Add-Member -MemberType NoteProperty -Name "tags" -Value $tagsArray -Force

# Reorganiser les paths
$paths = $jsonContent.paths.PSObject.Properties
$orderedPaths = New-Object System.Collections.Specialized.OrderedDictionary

# D'abord tous les /auth/
foreach ($path in $paths) {
    if ($path.Name -match "^/auth/") {
        $orderedPaths[$path.Name] = $path.Value
    }
}

# Puis tous les autres
foreach ($path in $paths) {
    if ($path.Name -notmatch "^/auth/") {
        $orderedPaths[$path.Name] = $path.Value
    }
}

$jsonContent.paths = $orderedPaths

# Sauvegarder
$jsonContent | ConvertTo-Json -Depth 100 -Compress:$false | Set-Content $swaggerJsonPath -Encoding UTF8
Write-Host "OK swagger.json corrige" -ForegroundColor Green
