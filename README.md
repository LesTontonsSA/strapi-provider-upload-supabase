# Strapi Upload Provider for Supabase Storage

This is a Strapi provider for uploading files to Supabase storage. The provider offers options for dynamic directories, file size limits, signed URLs, and transformation parameters.

## Parameters

The following parameters are used by the provider:

- **apiUrl** : Your Supabase API Url
- **apiKey** : Your Supabase API Key
- **bucket** : Your Supabase storage bucket. Defaults to 'strapi-uploads' if not provided.
- **directory** : Directory inside your Supabase storage bucket. Optional and dynamic by default.
- **options** : Additional options for the Supabase client and this provider.

The `options` parameter can include:

- **dynamic_directory** : Create dynamic directories based on the current year and month. Defaults to true if `directory` is not provided.
- **sizeLimit** : The maximum file size for uploads in bytes. Defaults to Infinity.
- **expiryMinutes** : The number of minutes until a signed URL expires. Defaults to 60.
- **download** : Whether to force the browser to download the file. This can be a boolean or a filename.
- **transform** : Transformation parameters for the file.

See the Supabase documentation for more information on these options.

## How to Use

### Install the Package

Run the following command in your terminal to install the package:

`npm i strapi-provider-upload-supabase`


### Create a Config File

Create a file named `config.js` in your root directory with the content provided below:

```javascript
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "strapi-provider-upload-supabase",
      providerOptions: {
        apiUrl: env("SUPABASE_API_URL"),
        apiKey: env("SUPABASE_API_KEY"),
        bucket: env("SUPABASE_BUCKET"),
        directory: env("SUPABASE_DIRECTORY"),
        options: {
          dynamic_directory: env.bool("SUPABASE_DYNAMIC_DIRECTORY", true),
          sizeLimit: env.int("SUPABASE_SIZE_LIMIT", Infinity),
          expiryMinutes: env.int("SUPABASE_EXPIRY_MINUTES", 60),
          download: env("SUPABASE_DOWNLOAD", false),
          transform: env.json("SUPABASE_TRANSFORM", {}),
        },
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
  // ...
});
```

### Create a `.env` File

Create a `.env` file in your root directory. Replace `<Your Supabase url>` and `<Your Supabase api key>` with the values obtained from the settings/api page of your Supabase project.

```javascript
SUPABASE_API_URL="<Your Supabase url>"
SUPABASE_API_KEY="<Your Supabase api key>"
SUPABASE_BUCKET="strapi-uploads"
SUPABASE_DIRECTORY=""
SUPABASE_DYNAMIC_DIRECTORY=true
SUPABASE_SIZE_LIMIT=Infinity
SUPABASE_EXPIRY_MINUTES=60
SUPABASE_DOWNLOAD=false
SUPABASE_TRANSFORM={}
```

### Create a Middleware

Create a file named `middlewares.js` in your root directory.
```javascript
module.exports = ({ env }) => [
  // ...
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "data:", "blob:", env("SUPABASE_API_URL")],
        },
      },
    },
  },
  // ...
];

```

## Resources

- MIT License
- [Strapi website](https://strapi.io/)
- [Strapi community on Slack](https://slack.strapi.io/)
- [Strapi news on Twitter](https://twitter.com/strapijs)
- [Strapi docs about upload](https://strapi.io/documentation/developer-docs/latest/plugins/upload.html)
- [Supabase website](https://supabase.io/)
- [Supabase documentation](https://supabase.io/docs)
- Source code for this provider
