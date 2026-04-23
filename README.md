# 🎫 Ticket Bot

Discord.js v14 ile yazılmış, Components V2 kullanan gelişmiş bir ticket sistemi.

## Özellikler

- Ticket açma paneli (banner + butonlar)
- Modal ile açılma sebebi alma
- Ticket kapatma → otomatik transcript + arşiv kategorisine taşıma
- Yeniden açma ve silme butonları
- Kullanıcı ekleme / kaldırma
- Log kanalına HTML transcript gönderme
- Tek kullanıcıya tek ticket limiti

## Kurulum

### 1. Repoyu klonla

```bash
git clone https://github.com/KULLANICI_ADI/ticket-bot.git
cd ticket-bot
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. `config.json` dosyasını düzenle

```json
{
  "token": "BOT_TOKEN",
  "staffRoleId": "STAFF_ROLE_ID",
  "logChannelId": "LOG_CHANNEL_ID",
  "ticketCategoryId": "TICKET_CATEGORY_ID",
  "archiveCategoryId": "ARCHIVE_CATEGORY_ID",
  "serverName": "Sunucu Adı",
  "bannerUrl": "https://i.imgur.com/BANNER.png"
}
```

| Alan | Açıklama |
|------|----------|
| `token` | Discord bot token'ı ([Discord Developer Portal](https://discord.com/developers/applications)) |
| `staffRoleId` | Ticket yönetim yetkisine sahip rolün ID'si |
| `logChannelId` | Transcript ve log mesajlarının gönderileceği kanal ID'si |
| `ticketCategoryId` | Açık ticketların oluşturulacağı kategori ID'si |
| `archiveCategoryId` | Kapatılan ticketların taşınacağı kategori ID'si |
| `serverName` | Bot durumunda görünecek sunucu adı |
| `bannerUrl` | Panel ve ticket mesajlarında gösterilecek banner görseli URL'si |

### 4. Botu başlat

```bash
node index.js
```

## Kullanım

### Panel Oluşturma

Ticket panelini oluşturmak istediğin kanalda şu komutu çalıştır:

```
.ticket
```

> `Manage Channels` yetkisi gerektirir.

### Ticket Akışı

1. Kullanıcı **Ticket Aç** butonuna tıklar
2. Açılan modalda sebebini yazar
3. Bot otomatik olarak `ticket-{id}` adında bir kanal oluşturur
4. Staff rolü kanala erişebilir
5. Staff **Ticket Kapat** butonuna basar → transcript log kanalına gönderilir, kanal arşive taşınır
6. **Yeniden Aç** veya **Sil** butonlarıyla işlem yapılabilir

### Diğer Komutlar

| Komut | Açıklama |
|-------|----------|
| `.ping` | Botun gecikmesini gösterir |

## Dosya Yapısı

```
ticket-bot/
├── index.js
├── config.json
├── emoji.json
├── commands/
│   ├── ping.js
│   └── ticket.js
└── events/
    ├── ready.js
    ├── messageCreate.js
    └── interactionCreate.js
```

## Gereksinimler

- Node.js v18+
- Discord.js v14
- Bot için `MESSAGE CONTENT INTENT` ve `SERVER MEMBERS INTENT` açık olmalı

## Lisans

MIT
