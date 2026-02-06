# Configuração TWA (Trusted Web Activity) para Android

Este guia explica como criar um app Android nativo que envolve o PWA da NOW Security usando Trusted Web Activity.

## Pré-requisitos

- Android Studio instalado
- Java JDK 11 ou superior
- Conta Google Play Console (para publicação)
- Domínio com HTTPS configurado

## Passo 1: Criar Projeto Android Studio

```bash
# Via Android Studio:
# File > New > New Project > Empty Activity
# Nome: NOW Security
# Package: com.nowsecurity.app
# Language: Kotlin
# Minimum SDK: 21 (Android 5.0)
```

## Passo 2: Configurar build.gradle (app)

```gradle
dependencies {
    implementation 'androidx.browser:browser:1.7.0'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
```

## Passo 3: Configurar AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.nowsecurity.app">

    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.NOWSecurity">
        
        <!-- Launcher Activity -->
        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="@string/app_name"
            android:exported="true">
            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="https://seu-dominio.com" />
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <data
                    android:scheme="https"
                    android:host="seu-dominio.com" />
            </intent-filter>
        </activity>
        
        <!-- Digital Asset Links -->
        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />
    </application>
</manifest>
```

## Passo 4: Configurar strings.xml

```xml
<resources>
    <string name="app_name">NOW Security</string>
    <string name="asset_statements">
        [{
            \"relation\": [\"delegate_permission/common.handle_all_urls\"],
            \"target\": {
                \"namespace\": \"web\",
                \"site\": \"https://seu-dominio.com\"
            }
        }]
    </string>
</resources>
```

## Passo 5: Gerar assetlinks.json

### 5.1 Gerar Keystore (se não tiver)

```bash
keytool -genkey -v -keystore now-security.keystore -alias now-security -keyalg RSA -keysize 2048 -validity 10000
```

### 5.2 Extrair SHA-256 Fingerprint

```bash
keytool -list -v -keystore now-security.keystore -alias now-security
```

### 5.3 Criar assetlinks.json no servidor

Coloque este arquivo em: `https://seu-dominio.com/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.nowsecurity.app",
    "sha256_cert_fingerprints": [
      "XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
    ]
  }
}]
```

## Passo 6: Configurar Splash Screen (Opcional)

```xml
<!-- res/drawable/splash_background.xml -->
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_bg" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo" />
    </item>
</layer-list>
```

## Passo 7: Build e Teste

### Testar em Debug

```bash
# Build debug
./gradlew assembleDebug

# Instalar no dispositivo
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Build para Release

```bash
# Build release
./gradlew assembleRelease

# Verificar assetlinks
adb shell pm get-app-links com.nowsecurity.app
```

## Passo 8: Publicar na Google Play Store

1. Criar app no Google Play Console
2. Configurar store listing
3. Upload do APK/AAB
4. Configurar classificação de conteúdo
5. Testar em beta
6. Publicar em produção

## Verificação

### Testar Digital Asset Links

```bash
# Via browser
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://seu-dominio.com&relation=delegate_permission/common.handle_all_urls
```

### Verificar TWA

Após instalar, o app deve:
- Abrir sem barra de URL do Chrome
- Funcionar como app nativo
- Mostrar splash screen
- Suportar notificações push
- Funcionar offline (via service worker)

## Troubleshooting

### TWA não abre (mostra Chrome Custom Tab)

1. Verificar assetlinks.json está acessível
2. Confirmar SHA-256 fingerprint correto
3. Verificar package name está correto
4. Aguardar até 48h para propagação do Digital Asset Link

### Notificações não funcionam

1. Adicionar `gcm_sender_id` no manifest.json
2. Configurar Firebase Cloud Messaging
3. Implementar service worker push handler

## Recursos Adicionais

- [Google TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap) - Ferramenta automática
- [PWA Builder](https://www.pwabuilder.com/) - Gerador visual de TWA
