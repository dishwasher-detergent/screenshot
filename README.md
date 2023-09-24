![image](https://github.com/dishwasher-detergent/screenshot/assets/33816169/b61b698e-c4bc-4fa9-b266-e7f03e9f733a)

## 🧰 Usage

### GET /

Returns HTML website with documentation for API.

**Response**

![image](https://github.com/dishwasher-detergent/screenshot/assets/33816169/dcb6f5a2-8f25-4f96-a2dd-a52e59c89496)

### GET /screenshot/:url

Returns an webp/png/jpeg image of the specified URL;

**Options**

| Query Param    | Type                | Default Value |
|----------------|---------------------|---------------|
| width          | number              | 1280          |
| height         | number              | 720           |
| scale          | number              | 1             |
| clipX          | number              |               |
| clipY          | number              |               |
| quality        | number              | 80            |
| format         | jpeg \| webp \| png | webp          |
| fullPage       | boolean             | false         |
| omitBackground | boolean             | false         |
| darkMode       | boolean             | false         |

**Response**

Sample `200` Response:

```
(image buffer)
```

### GET /video/:url

Returns an mp4 video of the specified URL;

**Options**

| Query Param    | Type                | Default Value     |
|----------------|---------------------|-------------------|
| width          | number              | 1280              |
| height         | number              | 720               |
| scale          | number              | 1                 |
| darkMode       | boolean             | false             |
| animation      | string              | 1000,500,0,smooth |

Animation values are created in the format: wait (the duration it stays after an animation has played), top (how many pixels to go from the top), left (how many pixles to go from the left), behavior (smooth, instant, auto)

Animations can be chained together using a colon. Example 1000,100,0,smooth:1000,300,0,smooth

**Response**

Sample `200` Response:

```
(video buffer)
```

### GET /metadata/:url

Returns a json representation of the meta tags for the specified URL;

**Response**

Sample `200` Response:

```json
[
  {
    "charset": "utf-8"
  },
  {
    "name": "description",
    "content": "Kenneth Bass' Portfolio of Projects!"
  },
  {
    "name": "viewport",
    "content": "width=device-width, initial-scale=1"
  }
]
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 30            |
