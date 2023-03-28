# iconlink

A Node.js CLI application that sets custom icons for folders based on a YAML configuration file.

## Requirements

- [Node.js](https://nodejs.org) (version >=12.0.0)
- [fileicon](https://github.com/mklement0/fileicon)

## Installation

### via [`npm`](https://npm.im/iconlink)

```bash
$ npm install -g iconlink
```

### Clone the Repository

```bash
$ git clone https://github.com/KevinZMa/iconlink.git /path/to/iconlink
$ cd /path/to/iconlink
```

## Usage

1. Set up your parent folder in this structure:

```bash
parent_folder/
├── .icons/    # where your icons are stored
│   ├── icon1.icns
│   └── icon2.icns
├── folder1/
├── folder2/
└── icons.yml  # configuration file
```


2. In the `icons.yml` file, specify the folder-icon mappings:

```yaml
folder1: icon1.icns
folder2: icon2.icns
```

3. Run the CLI app with the command:

<!-- TODO: complete help page from `--help` -->
```bash
$ iconlink <parent_folder> [--no-confirm]
```
