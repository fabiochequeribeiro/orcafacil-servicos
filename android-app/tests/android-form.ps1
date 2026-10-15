param([ValidateSet('quote', 'contract')][string]$Form)
$ErrorActionPreference = 'Stop'
$adbPath = 'C:\Users\BRS\AppData\Local\Android\Sdk\platform-tools\adb.exe'
$serial = 'emulator-5554'

function Read-Ui {
  & $adbPath -s $serial shell uiautomator dump /sdcard/orcafacil-ui.xml | Out-Null
  [xml]$document = (& $adbPath -s $serial shell cat /sdcard/orcafacil-ui.xml | Out-String)
  return $document
}

if ($Form -eq 'quote') {
  $fields = @(
    @{ Label = 'Cliente'; Value = 'Cliente%stestemunho%sficticio' },
    @{ Label = 'WhatsApp'; Value = '43999990000' },
    @{ Label = 'Endereço da visita'; Value = 'Rua%steste%s100' },
    @{ Label = 'Descrição'; Value = 'Troca%sde%stomada%spara%steste%sdo%scontrato' }
  )
} else {
  $fields = @(
    @{ Label = 'Nome / razão social do prestador'; Value = 'Prestador%sficticio%sde%steste' },
    @{ Label = 'CPF/CNPJ do prestador'; Value = '00000000000' },
    @{ Label = 'Telefone do prestador'; Value = '43999991111' },
    @{ Label = 'Endereço do prestador'; Value = 'Rua%sficticia%s200' },
    @{ Label = 'CPF/CNPJ do cliente'; Value = '00000000000' },
    @{ Label = 'Término previsto (AAAA-MM-DD)'; Value = '2026-10-03' },
    @{ Label = 'Pagamento: entrada, parcelas e vencimentos'; Value = 'Pix%sna%sentrega%sdo%sservico' },
    @{ Label = 'Materiais: lista, quantidades e quem fornece'; Value = 'Uma%stomada%sfornecida%spelo%scliente' },
    @{ Label = 'Equipamentos: lista e custos incluídos'; Value = 'Ferramentas%sdo%sprestador%sincluidas' }
  )
}

foreach ($field in $fields) {
  $found = $false
  for ($attempt = 0; $attempt -lt 9; $attempt++) {
    $ui = Read-Ui
    $node = $ui.SelectNodes('//node') | Where-Object { $_.GetAttribute('class') -eq 'android.widget.EditText' -and $_.GetAttribute('content-desc') -eq $field.Label } | Select-Object -First 1
    if ($node -and $node.GetAttribute('bounds') -match '^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$') {
      $x = [int]( ([int]$Matches[1] + [int]$Matches[3]) / 2 )
      $y = [int]( ([int]$Matches[2] + [int]$Matches[4]) / 2 )
      if ($y -gt 150 -and $y -lt 2150) {
        $placeholderValues = @('Nome do cliente', '(43) 99999-9999', 'Rua, número e bairro', 'Explique o serviço solicitado')
        if ($node.GetAttribute('text') -and $node.GetAttribute('text') -notin $placeholderValues) { throw "Field is not empty: $($field.Label)" }
        & $adbPath -s $serial shell input tap $x $y
        Start-Sleep -Milliseconds 600
        & $adbPath -s $serial shell input text $field.Value
        & $adbPath -s $serial shell input keyevent 4
        Write-Output "Filled: $($field.Label)"
        $found = $true
        break
      }
    }
    if ($attempt -lt 2) { & $adbPath -s $serial shell input swipe 530 650 530 1800 450 }
    else { & $adbPath -s $serial shell input swipe 530 1800 530 650 450 }
  }
  if (!$found) { throw "Field not visible: $($field.Label)" }
}
