const input = document.getElementById('search');

window.onload = () => {
  const value = input.value;
  setInputUrl(value);
  setDisplayUrl(value);
  generate();
};

input.addEventListener('keyup', function (event) {
  const value = event.target.value;

  setInputUrl(value);
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
  const value = encodeURIComponent(document.getElementById('search').value);
  generateMetadata(value);
  generateScreenshot(value);
  generateVideo(value);
}

async function generateMetadata(value) {
  setMetadataLoading(true);

  try {
    const response = await fetch(`https://6511a9d7aa283ecf10b1.appwrite.global/metadata/${value}`);
    const metadata = await response.json();

    const jsonString = JSON.stringify(metadata, null, 2);
    const highlightedJson = hljs.highlight('json', jsonString).value;
    document.getElementById('metadata').innerHTML = highlightedJson;
  } catch (err) {
    document.getElementById('metadata').innerHTML =
      '<p class="error">Error Generating Metadata</p>';
  }

  setMetadataLoading(false);
}

function generateScreenshot(value) {
  setScreenshotLoading(true);

  const screenshot = document.getElementById('screenshot');
  screenshot.innerHTML = '';

  const child = document.createElement('img');
  child.src = `https://6511a9d7aa283ecf10b1.appwrite.global/screenshot/${value}`;
  screenshot.appendChild(child);

  child.onload = () => {
    setScreenshotLoading(false);
  };

  child.onerror = () => {
    document.getElementById('screenshot').innerHTML =
      '<p class="error">Error Generating Image</p>';
    setScreenshotLoading(false);
  };
}

function generateVideo(value) {
  setVideoLoading(true);

  const video = document.getElementById('video');
  video.innerHTML = '';

  const child = document.createElement('video');
  child.src = `https://6511a9d7aa283ecf10b1.appwrite.global/record/${value}`;
  child.controls = true;
  child.autoplay = true;
  child.loop = true;
  video.appendChild(child);

  child.onload = () => {
    setVideoLoading(false);
  };

  child.onerror = () => {
    document.getElementById('video').innerHTML =
      '<p class="error">Error Generating Video</p>';
    setVideoLoading(false);
  };
}

function setDisplayUrl(value) {
  const elements = document.querySelectorAll('#display_url');

  for (let i = 0; i < elements.length; i++) {
    elements[i].textContent = value;
  }
}

function setInputUrl(value) {
  const encodedVal = encodeURIComponent(value);

  document.getElementById(
    'metadata_url'
  ).value = `https://6511a9d7aa283ecf10b1.appwrite.global/metadata/${encodedVal}`;
  document.getElementById(
    'screenshot_url'
  ).value = `https://6511a9d7aa283ecf10b1.appwrite.global/screenshot/${encodedVal}`;
  document.getElementById(
    'video_url'
  ).value = `https://6511a9d7aa283ecf10b1.appwrite.global/record/${encodedVal}`;
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
  const url = document.getElementById(value).value;
  navigator.clipboard.writeText(url);
}
