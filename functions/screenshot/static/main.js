const input = document.getElementById('search');

window.onload = () => {
  const value = input.value;
  setDisplayUrl(value);
};

input.addEventListener('keyup', function (event) {
  const value = event.target.value;

  document.getElementById(
    'metadata_url'
  ).value = `https://api.jibby.space/metadata/${value}`;
  document.getElementById(
    'screenshot_url'
  ).value = `https://api.jibby.space/screenshot/${value}`;

  setDisplayUrl(value);

  if (!isValidUrl(value)) {
    document.getElementById('search_button').disabled = true;
  } else {
    document.getElementById('search_button').disabled = false;
  }
});

input.addEventListener('keydown', function (event) {
  event.key === 'Enter' && generate();
});

function generate() {
  const value = document.getElementById('search').value;
  generateMetadata(value);
  generateScreenshot(value);
  generateVideo(value);
}

async function generateMetadata(value) {
  setMetadataLoading(true);
  const response = await fetch(`https://api.jibby.space/metadata/${value}`);
  const metadata = await response.json();

  const jsonString = JSON.stringify(metadata, null, 2);
  const highlightedJson = hljs.highlight('json', jsonString).value;

  document.getElementById('metadata').innerHTML = highlightedJson;
  setMetadataLoading(false);
}

function generateScreenshot(value) {
  setScreenshotLoading(true);
  const screenshot = document.getElementById('screenshot');
  screenshot.innerHTML = '';

  const child = document.createElement('img');
  child.src = `https://api.jibby.space/screenshot/${value}`;
  screenshot.appendChild(child);

  child.onload = () => {
    setScreenshotLoading(false);
  };
}

function generateVideo(value) {
  setVideoLoading(true);
  const video = document.getElementById('video');
  video.innerHTML = '';

  const child = document.createElement('video');
  child.src = `https://api.jibby.space/video/${value}`;
  child.controls = true;
  child.autoplay = true;
  child.loop = true;
  video.appendChild(child);

  child.onload = () => {
    setVideoLoading(false);
  };
}

function setDisplayUrl(value) {
  const elements = document.querySelectorAll('#display_url');

  for (let i = 0; i < elements.length; i++) {
    elements[i].textContent = value;
  }
}

function setMetadataLoading(value) {
  const elements = document.querySelectorAll('.metadata_loading');

  const display = value ? 'block' : 'none';

  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = display;
  }
}

function setScreenshotLoading(value) {
  const elements = document.querySelectorAll('.screenshot_loading');

  const display = value ? 'block' : 'none';

  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = display;
  }
}

function setVideoLoading(value) {
  const elements = document.querySelectorAll('.video_loading');

  const display = value ? 'block' : 'none';

  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = display;
  }
}

function isValidUrl(url) {
  const pattern = /^https:\/\/([\da-z.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/;
  return pattern.test(url);
}

function copyToClipboard(value) {
  console.log(value);
  const url = document.getElementById(value).value;
  navigator.clipboard.writeText(url);
}
