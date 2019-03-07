# tabio-wallpapers

Set your desktop background to an image from [tab.gladly.io](https://tab.gladly.io/)

## Installation

```bash
$ npm install -g tabio-wallpapers
```

## Usage

You simple execute at the terminal
```bash
tabio-wallpapers
```

Now check your desktop background

## Cycle

You can set a cron job to change your desktop background hourly.
```bash
crontab -l > currentcron
echo "0 * * * * tabio-wallpapers" >> currentcron
crontab currentcron
rm currentcron

```

