<div align="center">
<img src="https://raw.githubusercontent.com/SkyEye-FAST/verdigloss/master/src/assets/icon.png">

----

# Verdigloss

![GitHub License](https://img.shields.io/github/license/SkyEye-FAST/verdigloss)
[![GitHub stars](https://img.shields.io/github/stars/SkyEye-FAST/verdigloss)](https://github.com/SkyEye-FAST/verdigloss/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/SkyEye-FAST/verdigloss)](https://github.com/SkyEye-FAST/verdigloss/issues)
</div>

A simple web project for querying standard Minecraft translations, built with [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/).

This project is a successor to [SkyEye-FAST/minecraft_translation_flask](https://github.com/SkyEye-FAST/minecraft_translation_flask), written entirely in the frontend.

The project name **"Verdigloss"** comes from **"verdant + glossary + glossostigma"**. "Verdant" symbolizes vitality, "glossary" implies translation, and glossostigma is one of the smallest aquatic plants.

## Demostration

You can try the demo at the following links:

* <https://verdigloss.vercel.app/>

## Usage

To use this project, you need to have Node.js installed on your computer. Then, follow these steps:

1. Install pnpm (if not already installed). See <https://pnpm.io/installation> for more information.

   You can use another package manager instead.

2. Clone this repository:

   ```shell
   git clone https://github.com/SkyEye-FAST/verdigloss.git
   ```

3. Install dependencies:

   ```shell
   cd verdigloss
   pnpm install
   ```

4. Start the development server:

   ```shell
   pnpm dev
   ```

5. Open your browser and go to `http://localhost:5173/`.

### Production Build

To build for production:

```shell
pnpm build
```

The built files will be in the `dist` directory.

## Feedback

Please feel free to raise issues for any problems encountered or feature suggestions.

Pull requests are welcome.

## License

This project is released under the [Apache 2.0 license](LICENSE).

``` text
  Copyright 2025 SkyEye_FAST

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
```
