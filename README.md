#  Massa Swap - Test Contracts

# Requirements

- massa-node & massa-client running

## Setup

### Build

First we need to build :
- token => an implementation of an ERC20 contract
- swap  => used for swapping a token for another
- main

```shell
yarn build
```

### Deploy

Deploy the contract using massa-client:

```shell
send_smart_contract <address> <...>\build\main.wasm 100000000 0 0 0
```

Filter events on contracts

```shell
get_filtered_sc_output_event caller_address=<yourAddress>
```
