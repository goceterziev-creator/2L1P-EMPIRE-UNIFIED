# 2L1P Neural Travel — MVP v2

## Included
- Offer creation form
- JSON database
- Offer client page (`/offer/:id`)
- PDF generation (`/api/offers/:id/pdf`)
- WhatsApp share link
- Admin dashboard (`/admin`)
- Health endpoint (`/api/health`)

## Run locally
```bash
npm install
npm start
```

Open:
- http://localhost:3001/
- http://localhost:3001/admin

## Notes
- Data is stored in `DATABASE/database.json`
- PDFs are generated live from the backend
- WhatsApp link uses the client phone if available
