# Signum Art Mass Upload Tool

![node-current](https://img.shields.io/node/v/@signumart/massup?style=for-the-badge)
![npm (scoped)](https://img.shields.io/npm/v/@signumart/massup?style=for-the-badge)
![npm type definitions](https://img.shields.io/npm/types/@signumart/massup?style=for-the-badge)

Command line based tool to automate minting of collections with dozens, hundreds or thousands of NFTs for [Signum NFT Platform](https://signumart.io)

![signumart logo small](https://user-images.githubusercontent.com/3920663/171498534-ef94cdbd-edae-4b63-be73-6028c87813e5.png)

### Installation

`npm i @signumart/massup -g`

```
$> signumart-massup --help

Usage: signumart-massup [options] [command]


            @@@@@@@@  @@@@@@@
         @@@@@    @@@@@    @@@@@
           @@@  @@@  @@@ @@@@@
    @@@      @@@@@     @@@@       @@@
  @@@@@@@@ &@@@  @@@@@@@@ @@@@  @@@@@@@
 @@@    @@@@       @@@      @@@@@    @@@
 @@@  @@@ *@@@@           @@@  @@@  @@@@
   @@@@@     @@@         @@@     @@@@@
 @@@@  @@@  @@@           @@@@  @@@  @@@
 @@@    @@@@@      @@@       @@@@    @@@
  @@@@@@@  @@@  @@@@@@@@  @@@  @@@@@@@@
    @@@       @@@@     @@@@@      @@@
           @@@@  @@@  @@@  @@@
         @@@@@    @@@@@    @@@@@
            @@@@@@@  @@@@@@@@

         SignumArt Mass Upload Tool

  Author: ohager
  Version: 1.0.0-beta


Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  profile
  collection
  help [command]  display help for command
```

# Brief Usage Explanation

## Concept

The basic idea of this tool is that you as an artist provide a CSV file, that describes all necessary minting parameters, like
name, description, listing option, price, location of media files, etc. Once provided you generate the artifacts, like
thumbnails, meta data etc on your machine and finally you start the automation for minting.

---

Full documentation is available [here](https://docs.signum.network/nftportal/mass-upload-of-nfts)

---

![workflow](https://archbee.imgix.net/l2AIpSUU6srSQmG1-K2bb/aY7IqX5LMA4q8hrmrqsKY_image.png?auto=format&ixlib=react-9.1.1&w=1174&h=894&dpr=1&q=75)

## Before you start

As a requirement to use that tool, you [must have a profile](https://docs.signum.network/nftportal/create-your-profile) on [signumart.io](https://signumart.io),
which in turn requires you to have an Signum Account with sufficient balance.

Once created the profile you have to configure your profile locally on your machine using the following command:

```
$> signumart-massup profile init

✔ No profile found
? Please select a network: Signum Test Net
? Please enter your passphrase: ********
? Please enter a personal PIN to secure your secrets: [hidden]
? Please confirm your PIN: [hidden]
✔ Selecting best host
Selected Host https://europe3.testnet.signum.network
✔ Verifying account [TS-QAJA-QW5Y-SWVP-4RVP4]
? Which Pinning Service do you use? Pinata
? Please enter your Pinning API Key (JWT):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ********
┌────────────────┬────────────────────────────────┐
│    (index)     │             Values             │
├────────────────┼────────────────────────────────┤
│    Network     │       'Signum Test Net'        │
│    Account     │   'TS-QAJA-QW5Y-SWVP-4RVP4'    │
│      Name      │            'ohager'            │
│  Description   │ 'Just a simple dev... or not?' │
│ PinningService │            'Pinata'            │
└────────────────┴────────────────────────────────┘
? Is this correct? Yes
Profile successfully initialized
```

## Overview of the workflow

Imagine you have somehow generated hundreds of collectible, and now you want to mint them all. This is where this tool comes into play.
The basic concept is a 4-step workflow you need to follow:

1. Create (or continues) a collection
2. Describe the NFTs by editing a provided [CSV template](./template.csv)
3. Prepare minting artifacts according to the CSV description
4. Uploads media files and mints NFTs

```
$> signumart-massup collection --help

Usage: signumart-massup collection [options] [command]

Options:
-h, --help                display help for command

Commands:
create|init [options]     Creates a new Collection
pull|continue             Pulls existing collection information to continue on adding new NFTs
commit|prepare [options]  Prepares the collection for upload
push|upload [options]     Uploads the collection
help [command]            display help for command
```

> The command line tool is interactive, so it guides you through all the necessary steps.

For each command you can always get a brief help of available options:

```
$> signumart-massup collection push --help

Usage: signumart-massup collection push|upload [options]

Uploads the collection

Options:
  -t, --try   Runs without creating anything on chain. Good for testing
  -h, --help  display help for command

```
