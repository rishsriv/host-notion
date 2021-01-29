//This function basically opens Notion, rewrites a few meta tags, and then opens the page
//Heavily inspired from Fruition (https://github.com/stephenou/fruitionsite). I just modified Stephen Nou's script a little

//domain or subdomain name goes here
const MY_DOMAIN = 'rish.blog';

//slugs and their associated things go here
const SLUG_TO_PAGE = {
  "": "eb7fd27359cf46139234e9a048ed3a1c",
  "blog": "92c51d7363e847df92806b1930b62dd9",
  "about": "ca36a5648802489284cd03fa62f5a7c8",
  "learnings": "b9df40b673e2435baa3ec6c21aa5c00e",
  "ideas": "f421ff71640247f8a7c4380eac4cfc49",
  "planning": "ec12596ce7ad4679ab7828060cc463fe",
  "full-stack-data": "6b40e989d5354820a63d2a8111b90edc",
  "posts/what-didnt-work.html": "798b8a701ae844ef9a2cb36e65e01909",
  "posts/cyber-attack.html": "f0d0f4c562374cf4809a23b4fec49371",
  "posts/mental-health.html": "0760d4fd513444a7827c9b1343f295bd",
  "ai-crm": "30560dc4bf7042548059bfc6e8bade80",
  "sat": "e29b737f7608488dbe1e75fbec82f8b8",
  "ai-media-automation.html": "afd3e474605a4c83af2be6dfcfe16be3",
  "resources": "cda0ecb862e84ef3a227fef69a6095fa",
  "heuristics-decision-making": "507b3ad4819f47fe9ef41f083efb7572"
};

//add meta description here
const PAGE_TITLES = {
  "": "Rishabh Srivastava: Developer and Data Entrepreneur",
  "blog": "Blog | Rishabh Srivastava",
  "about": "About Me | Rishabh Srivastava",
  "learnings": "Learning Log | Rishabh Srivastava",
  "ideas": "Idea Log | Rishabh Srivastava",
  "planning": "Planning for 2021 | Rishabh Srivastava",
  "full-stack-data": "A wiki for Full Stack Data | Rishabh Srivastava",
  "posts/what-didnt-work.html": "What didn't work: failing with 5 startups before not failing with one",
  "posts/cyber-attack.html": "Dealing with a cyber-attack: lessons learnt",
  "posts/mental-health.html": "Developing personal protocols for maintaining mental health",
  "ai-crm": "Using Machine Learning to extract insights from customer names and images",
  "sat": "Using satellite data to track economic change in developing countries",
  "ai-media-automation.html": "Dear Journalists, AI is coming for your jobs",
  "resources": "Resources to share with other people",
  "heuristics-decision-making": "Heuristics for decision making"
}

const PAGE_DESCRIPTIONS = {
  "": 'I am a full-stack developer and data scientist living in Singapore',
  "blog": "Posts about data, startups, and personal growth",
  "about": "Things I've done and how I work",
  "learnings": "Summaries of things I've read, watched, or listened to",
  "ideas": "This is a dump of ideas in all forms – from shower thoughts to well thought through meditations",
  "planning": "A high level plan for what I hope to do in 2021",
  'full-stack-data': 'Documents and wiki of how I intend to build full stack data',
  'posts/what-didnt-work.html': "Before Loki.ai became a financially sustainable venture, I failed with 5 other startups over 5 years. Here is what I learnt.",
  "posts/cyber-attack.html": "We faced a major cyber-attack on 5th May. Here are the lessons we learnt.",
  "posts/mental-health.html": "Over the last year, I tried to develop personal protocols to maintain my mental health and make it less sensitive to external events. This post contains a summary of these protocols.",
  "ai-crm": "Customer names and images have enormous predictive value, and can be used for a number of use cases in marketing, ecommerce, and sociology.",
  "sat": "Frequently updated satellite imagery can be used to track economic change at the macro- and micro-levels in developing countries",
  "ai-media-automation.html": "Repetitive journalism will soon get automated, leading to both increased productivity and job losses",
  "resources": "Links to resources that people other than me may find helpful",
  "heuristics-decision-making": "Rules I have used for making better decisions"
}

DEFAULT_TITLE = "Rishabh's Notes";
DEFAULT_DESC = "Notes, posts, and resources that I have kept handy";

//add font here
const GOOGLE_FONT = '';

//add analytics or other scripts here
const CUSTOM_SCRIPT = `<script src="https://static.loki.ai/analytics.min.js"></script><script>document.addEventListener("DOMContentLoaded", loki_log_enter_data('rish_blog'));</script>`;

const PAGE_TO_SLUG = {};
const slugs = [];
const pages = [];
Object.keys(SLUG_TO_PAGE).forEach(slug => {
  const page = SLUG_TO_PAGE[slug];
  slugs.push(slug);
  pages.push(page);
  PAGE_TO_SLUG[page] = slug;
});

addEventListener('fetch', event => {
  console.log(`Received new request: ${event.request.url}`);
  event.respondWith(fetchAndApply(event.request));
});

function generateSitemap() {
  let sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  slugs.forEach(
    (slug) =>
      (sitemap +=
        '<url><loc>https://' + MY_DOMAIN + '/' + slug + '</loc></url>')
    );
    sitemap += '</urlset>';
    return sitemap;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function handleOptions(request) {
  if (request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        'Allow': 'GET, HEAD, POST, PUT, OPTIONS',
      }
    });
  }
}

async function fetchAndApply(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  let url = new URL(request.url);
  url.hostname = 'www.notion.so';

  if (url.pathname === '/robots.txt') {
    return new Response('Sitemap: https://' + MY_DOMAIN + '/sitemap.xml');
  }

  if (url.pathname === '/sitemap.xml') {
    let response = new Response(generateSitemap());
    response.headers.set('content-type', 'application/xml');
    return response;
  }

  let response;
  if (url.pathname.startsWith('/app') && url.pathname.endsWith('js')) {
    response = await fetch(url.toString());
    let body = await response.text();
    response = new Response(body.replace(/www.notion.so/g, MY_DOMAIN).replace(/notion.so/g, MY_DOMAIN), response);
    response.headers.set('Content-Type', 'application/x-javascript');
    return response;
  } else if ((url.pathname.startsWith('/api'))) {
    // Forward API
    response = await fetch(url.toString(), {
      body: request.body,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
      },
      method: 'POST',
    });
    response = new Response(response.body, response);
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } else if (slugs.indexOf(url.pathname.slice(1)) > -1) {
    const pageId = SLUG_TO_PAGE[url.pathname.slice(1)];
    return Response.redirect('https://' + MY_DOMAIN + '/' + pageId, 301);
  } else {
    response = await fetch(url.toString(), {
      body: request.body,
      headers: request.headers,
      method: request.method,
    });
    response = new Response(response.body, response);
    response.headers.delete('Content-Security-Policy');
    response.headers.delete('X-Content-Security-Policy');
  }

  const slug = PAGE_TO_SLUG[url.pathname.slice(1)];

  return appendJavascript(response, SLUG_TO_PAGE, slug);
}

class MetaRewriter {
  constructor(slug) {
    this.slug = slug;
  }
  element(element) {
    const slug = this.slug;
    let title;
    let description;
    if (slug in PAGE_TITLES) {
      title = PAGE_TITLES[slug];
      description = PAGE_DESCRIPTIONS[slug];
    } else {
      title = DEFAULT_TITLE;
      description = DEFAULT_DESC;
    }
    if (element.getAttribute('property') === 'og:title'
      || element.getAttribute('name') === 'twitter:title') {
      element.setAttribute('content', title);
    }
    if (element.tagName === 'title') {
      element.setInnerContent(title);
    }
    
    if (element.getAttribute('name') === 'description'
      || element.getAttribute('property') === 'og:description'
      || element.getAttribute('name') === 'twitter:description') {
      element.setAttribute('content', description);
    }
    
    if (element.getAttribute('property') === 'og:url'
      || element.getAttribute('name') === 'twitter:url') {
      element.setAttribute('content', MY_DOMAIN);//should this be MY_DOMAIN + current url?
    }
    if (element.getAttribute('name') === 'apple-itunes-app') {
      element.remove();
    }
  }
}

class HeadRewriter {
  element(element) {
    if (GOOGLE_FONT !== '') {
      element.append(`<link href="https://fonts.googleapis.com/css?family=${GOOGLE_FONT.replace(' ', '+')}:Regular,Bold,Italic&display=swap" rel="stylesheet">
      <style>* { font-family: "${GOOGLE_FONT}" !important; }</style>`, {
        html: true
      });
    }
    element.append(`<style>
    div.notion-topbar > div > div:nth-child(3) { display: none !important; }
    div.notion-topbar > div > div:nth-child(4) { display: none !important; }
    div.notion-topbar > div > div:nth-child(5) { display: none !important; }
    div.notion-topbar > div > div:nth-child(6) { display: none !important; }
    div.notion-topbar-mobile > div:nth-child(3) { display: none !important; }
    div.notion-topbar-mobile > div:nth-child(4) { display: none !important; }
    div.notion-topbar > div > div:nth-child(1n).toggle-mode { display: block !important; }
    div.notion-topbar-mobile > div:nth-child(1n).toggle-mode { display: none !important; }
    </style>`, {
      html: true
    })
  }
}

class ScriptRewriter {
  element(element) {
    element.remove();
  }
}

class BodyRewriter {
  constructor(SLUG_TO_PAGE) {
    this.SLUG_TO_PAGE = SLUG_TO_PAGE;
  }
  element(element) {
    element.append(`
    <script>
    const SLUG_TO_PAGE = ${JSON.stringify(this.SLUG_TO_PAGE)};
    const PAGE_TO_SLUG = {};
    const slugs = [];
    const pages = [];
    const el = document.createElement('div');
    let redirected = false;
    Object.keys(SLUG_TO_PAGE).forEach(slug => {
      const page = SLUG_TO_PAGE[slug];
      slugs.push(slug);
      pages.push(page);
      PAGE_TO_SLUG[page] = slug;
    });
    function getPage() {
      return location.pathname.slice(-32);
    }
    function getSlug() {
      return location.pathname.slice(1);
    }
    function updateSlug() {
      const slug = PAGE_TO_SLUG[getPage()];
      if (slug != null) {
        history.replaceState(history.state, '', '/' + slug);
      }
    }
    function onDark() {
      el.innerHTML = '<div style="margin-left: auto; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgb(46, 170, 220); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(12px) translateY(0px);"></div></div></div></div>';
      document.body.classList.add('dark');
      __console.environment.ThemeStore.setState({ mode: 'dark' });
    };
    function onLight() {
      el.innerHTML = '<div style="margin-left: auto; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgba(135, 131, 120, 0.3); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(0px) translateY(0px);"></div></div></div></div>';
      document.body.classList.remove('dark');
      __console.environment.ThemeStore.setState({ mode: 'light' });
    }
    function toggle() {
      if (document.body.classList.contains('dark')) {
        onLight();
      } else {
        onDark();
      }
    }
    function addDarkModeButton(device) {
      const nav = device === 'web' ? document.querySelector('.notion-topbar').firstChild : document.querySelector('.notion-topbar-mobile');
      el.className = 'toggle-mode';
      el.addEventListener('click', toggle);
      nav.appendChild(el);
      onLight();
    }
    const observer = new MutationObserver(function() {
      if (redirected) return;
      const nav = document.querySelector('.notion-topbar');
      const mobileNav = document.querySelector('.notion-topbar-mobile');
      if (nav && nav.firstChild && nav.firstChild.firstChild
        || mobileNav && mobileNav.firstChild) {
        redirected = true;
        updateSlug();
        addDarkModeButton(nav ? 'web' : 'mobile');
        const onpopstate = window.onpopstate;
        window.onpopstate = function() {
          if (slugs.includes(getSlug())) {
            const page = SLUG_TO_PAGE[getSlug()];
            if (page) {
              history.replaceState(history.state, 'bypass', '/' + page);
            }
          }
          onpopstate.apply(this, [].slice.call(arguments));
          updateSlug();
        };
      }
    });
    observer.observe(document.querySelector('#notion-app'), {
      childList: true,
      subtree: true,
    });
    const replaceState = window.history.replaceState;
    window.history.replaceState = function(state) {
      if (arguments[1] !== 'bypass' && slugs.includes(getSlug())) return;
      return replaceState.apply(window.history, arguments);
    };
    const pushState = window.history.pushState;
    window.history.pushState = function(state) {
      const dest = new URL(location.protocol + location.host + arguments[2]);
      const id = dest.pathname.slice(-32);
      if (pages.includes(id)) {
        arguments[2] = '/' + PAGE_TO_SLUG[id];
      }
      return pushState.apply(window.history, arguments);
    };
    const open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
      arguments[1] = arguments[1].replace('${MY_DOMAIN}', 'www.notion.so');
      return open.apply(this, [].slice.call(arguments));
    };
  </script>${CUSTOM_SCRIPT}`, {
      html: true
    });
  }
}

async function appendJavascript(res, SLUG_TO_PAGE, slug) {
  return new HTMLRewriter()
    .on('title', new MetaRewriter(slug))
    .on('meta', new MetaRewriter(slug))
    .on('head', new HeadRewriter())
    .on('body', new BodyRewriter(SLUG_TO_PAGE))
    //.on('script', new ScriptRewriter())
    .transform(res);
}