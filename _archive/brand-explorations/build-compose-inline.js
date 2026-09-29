// Rebuild docker-compose.yml with the current brand book inlined as an nginx config.
// Run after editing k8-brand-guidelines.html:  node brand/deploy/build-compose.js
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'k8-brand-guidelines.html'), 'utf8');
// Compose interpolates ${...}; "$$" is a literal "$"
const body = html.replace(/\$/g, '$$$$').replace(/\r\n/g, '\n').split('\n')
  .map(l => (l ? '      ' + l : '')).join('\n');

// compose does not recreate the container when configs.content changes,
// so a content-hash label forces a recreate on every HTML change
const hash = crypto.createHash('sha1').update(html).digest('hex').slice(0, 12);

const yml = `services:
  brandci:
    image: nginx:alpine
    container_name: brandci
    restart: unless-stopped
    labels:
      brandci.content-hash: "${hash}"
    ports:
      - "8090:80"
    configs:
      - source: brandci_nginx
        target: /etc/nginx/conf.d/default.conf
      - source: brandci_index
        target: /usr/share/nginx/html/index.html

configs:
  brandci_nginx:
    content: |
      server {
        listen 80;
        server_name _;
        charset utf-8;
        root /usr/share/nginx/html;
        location / {
          try_files $$uri /index.html;
        }
      }
  brandci_index:
    content: |
${body}
`;
fs.writeFileSync(path.join(__dirname, 'docker-compose.yml'), yml);
console.log(`wrote docker-compose.yml (${(yml.length / 1024).toFixed(1)} KB)`);
