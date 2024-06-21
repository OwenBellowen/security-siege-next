![Security Siege](./assets/Security%20Siege.gif)

# Security Siege

[![GitHub License](https://img.shields.io/github/license/Owenbellowen/security-siege-next)
](https://github.com/OwenBellowen/security-siege-next/blob/main/LICENSE)  [![GitHub issues](https://img.shields.io/github/issues/OwenBellowen/security-siege-next)](https://github.com/OwenBellowen/security-siege-next/issues)  [![CodeQL](https://github.com/OwenBellowen/security-siege-next/actions/workflows/codeql.yml/badge.svg)](https://github.com/OwenBellowen/security-siege-next/actions/workflows/codeql.yml)  [![Dependabot Updates](https://github.com/OwenBellowen/security-siege-next/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/OwenBellowen/security-siege-next/actions/workflows/dependabot/dependabot-updates)  [![Dependency review](https://github.com/OwenBellowen/security-siege-next/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/OwenBellowen/security-siege-next/actions/workflows/dependency-review.yml)  
A rewrite of my Discord bot - Security Siege

## About
This is a rewrite of my Discord bot, Security Siege. It is a bot that is designed to help moderate servers and provide useful tools for server owners and administrators. It is written in TypeScript and uses the Discord.js library. It is currently in development and is not yet ready for use.

## Installation

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file in the root directory and add the following:

```
TOKEN=YOUR_DISCORD_BOT_TOKEN
```

4. Create a `config.json` file in the `src` directory and add the following:

```json
{
    "guildID": "",
    "mongoURI": "",
    "owners": []
}
```
5. Run `npm start`

## TODO

- [ ] Add more commands
- [ ] Add more features (e.g. warnings, mutes, etc.)
- [ ] Add more handlers (e.g. error handler, interaction handler, etc.)

### Changelog

- [x] Added basic handlers and commands
- [x] Warning system
- [x] Ticket system

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. If you have any questions, please open an issue.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Discord.js](https://discord.js.org)
- [Node.js](https://nodejs.org)
- [npm](https://npmjs.com)

## Author

- [OwenBellowen](https://github.com/OwenBellowen)