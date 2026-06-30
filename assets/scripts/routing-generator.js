(function(){
  const dnsHostsContainer = document.getElementById('dnshosts_list');

  function addDnsHostRow(host, ip){
    const row = document.createElement('div');
    row.className = 'dns-pair';
    row.innerHTML = `
      <input type="text" class="dns-host" placeholder="dns.google" value="${host||''}">
      <input type="text" class="dns-ip" placeholder="8.8.8.8" value="${ip||''}">
      <button class="mini-btn dns-remove" type="button">×</button>
    `;
    row.querySelector('.dns-remove').addEventListener('click', () => row.remove());
    dnsHostsContainer.appendChild(row);
  }

  function seedDefaults(){
    dnsHostsContainer.innerHTML = '';
    addDnsHostRow('dns.google', '8.8.8.8');
    addDnsHostRow('cloudflare-dns.com', '1.1.1.1');
  }
  seedDefaults();

  document.getElementById('add_dnshost').addEventListener('click', () => addDnsHostRow('', ''));

  function linesToArray(textareaId){
    const raw = document.getElementById(textareaId).value;
    return raw.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  }

  function collectDnsHosts(){
    const hosts = {};
    dnsHostsContainer.querySelectorAll('.dns-pair').forEach(row => {
      const h = row.querySelector('.dns-host').value.trim();
      const ip = row.querySelector('.dns-ip').value.trim();
      if(h && ip){ hosts[h] = ip; }
    });
    return hosts;
  }

  function buildProfile(){
    return {
      DirectSites: linesToArray('f_directsites'),
      Name: document.getElementById('f_name').value.trim() || 'New Profile',
      DomesticDNSType: document.getElementById('f_domestic_dns_type').value,
      DirectIp: linesToArray('f_directip'),
      BlockSites: linesToArray('f_blocksites'),
      FakeDns: document.getElementById('f_fakedns').checked,
      DomesticDNSDomain: document.getElementById('f_domestic_dns_domain').value.trim(),
      ProxySites: linesToArray('f_proxysites'),
      GeoipUrl: document.getElementById('f_geoip_url').value.trim(),
      ProxyIp: linesToArray('f_proxyip'),
      DomainStrategy: document.getElementById('f_domainstrategy').value,
      DnsHosts: collectDnsHosts(),
      GlobalProxy: document.getElementById('f_globalproxy').checked,
      BlockIp: linesToArray('f_blockip'),
      UseChunkFiles: document.getElementById('f_usechunkfiles').checked,
      DomesticDNSIp: document.getElementById('f_domestic_dns_ip').value.trim(),
      RemoteDNSIp: document.getElementById('f_remote_dns_ip').value.trim(),
      RemoteDNSDomain: document.getElementById('f_remote_dns_domain').value.trim(),
      RemoteDNSType: document.getElementById('f_remote_dns_type').value,
      LastUpdated: 0,
      RouteOrder: document.getElementById('f_routeorder').value,
      GeositeUrl: document.getElementById('f_geosite_url').value.trim()
    };
  }

  function utf8ToBase64(str){
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  function syntaxHighlight(jsonStr){
    return jsonStr.replace(/(&)/g, '&amp;').replace(/(<)/g, '&lt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b)/g,
        (match) => {
          let cls = 'n';
          if (/^"/.test(match)) {
            cls = /:$/.test(match) ? 'k' : 's';
          } else if (/true|false/.test(match)) {
            cls = 'b';
          }
          return `<span class="${cls}">${match}</span>`;
        });
  }

  function generate(){
    const profile = buildProfile();
    const jsonStr = JSON.stringify(profile, null, 2);
    const compactJsonStr = JSON.stringify(profile);
    const b64 = utf8ToBase64(compactJsonStr);
    const deepLink = `happ://routing/add/${b64}`;

    document.getElementById('deeplink_text').textContent = deepLink;
    document.getElementById('json_text').innerHTML = syntaxHighlight(jsonStr);
    document.getElementById('output_block').classList.add('visible');
    document.getElementById('output_block').scrollIntoView({behavior:'smooth', block:'nearest'});

    return { deepLink, jsonStr };
  }

  let lastGenerated = null;

  document.getElementById('generate_btn').addEventListener('click', () => {
    lastGenerated = generate();
  });

  document.getElementById('reset_btn').addEventListener('click', () => {
    document.getElementById('f_name').value = 'RU без VPN с AdBlock';
    document.getElementById('f_domainstrategy').value = 'IPIfNonMatch';
    document.getElementById('f_routeorder').value = 'block-direct-proxy';
    document.getElementById('f_globalproxy').checked = true;
    document.getElementById('f_fakedns').checked = false;
    document.getElementById('f_usechunkfiles').checked = true;
    document.getElementById('f_directsites').value = 'domain:.ru\ndomain:.su\ndomain:.xn--p1ai\ngeosite:category-ru';
    document.getElementById('f_proxysites').value = '';
    document.getElementById('f_blocksites').value = 'geosite:CATEGORY-ADS';
    document.getElementById('f_directip').value = '10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16\n169.254.0.0/16\n224.0.0.0/4\n255.255.255.255';
    document.getElementById('f_proxyip').value = '';
    document.getElementById('f_blockip').value = '';
    document.getElementById('f_domestic_dns_type').value = 'DoH';
    document.getElementById('f_domestic_dns_domain').value = 'https://dns.google/dns-query';
    document.getElementById('f_domestic_dns_ip').value = '8.8.8.8';
    document.getElementById('f_remote_dns_type').value = 'DoH';
    document.getElementById('f_remote_dns_domain').value = 'https://cloudflare-dns.com/dns-query';
    document.getElementById('f_remote_dns_ip').value = '1.1.1.1';
    document.getElementById('f_geoip_url').value = 'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat';
    document.getElementById('f_geosite_url').value = 'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat';
    seedDefaults();
    document.getElementById('output_block').classList.remove('visible');
  });

  function flashCopied(id){
    const el = document.getElementById(id);
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1400);
  }

  document.getElementById('copy_link_btn').addEventListener('click', async () => {
    if(!lastGenerated){ lastGenerated = generate(); }
    try{
      await navigator.clipboard.writeText(lastGenerated.deepLink);
      flashCopied('link_copied');
    }catch(e){
      const ta = document.createElement('textarea');
      ta.value = lastGenerated.deepLink;
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      flashCopied('link_copied');
    }
  });

  document.getElementById('copy_json_btn').addEventListener('click', async () => {
    if(!lastGenerated){ lastGenerated = generate(); }
    try{
      await navigator.clipboard.writeText(lastGenerated.jsonStr);
      flashCopied('json_copied');
    }catch(e){
      const ta = document.createElement('textarea');
      ta.value = lastGenerated.jsonStr;
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      flashCopied('json_copied');
    }
  });

  // initial generate on load so something is visible
  lastGenerated = generate();
})();
