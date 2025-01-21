# Lighthouse JS

A fast and efficient service for looking up Antelope accounts across multiple networks using public keys. This service helps you discover which accounts are associated with a specific public key across various Antelope-based blockchains.

## Features

- Look up accounts by public key across multiple Antelope networks
- Support for both mainnet and testnet chains
- Fast parallel lookups
- Simple REST API interface

## API Usage

### Lookup Accounts by Public Key

```bash
GET /lookup/{publicKey}
```

Query Parameters:
- `includeTestnets` (optional): Set to 'true' to include testnet chains in the lookup

Example Response:
```json
[
  {
    "network": "EOS",
    "chainId": "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
    "accounts": ["account1", "account2"]
  },
  {
    "network": "WAX",
    "chainId": "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
    "accounts": ["account3"]
  }
]
```

## Development

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun dev
```

3. Run tests:
```bash
bun test
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
