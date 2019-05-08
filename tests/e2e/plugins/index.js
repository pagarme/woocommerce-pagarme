// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const pagarme = require('pagarme')
let client

const getClient = (apiKey) => {
  if (!client) {
    client = pagarme.client.connect({ api_key: apiKey })
  }

  return client
}

const getTransaction = (apiKey, body) =>
  getClient(apiKey)
    .then(client => client.transactions.find(body))
    .then(transactions => transactions[0])

const getPostback = (apiKey, transactionId) =>
  getClient(apiKey)
    .then((client) =>
      client.postbacks.find({ transactionId: transactionId})
    )

const getLastTransaction = (apiKey) =>
  getClient(apiKey)
    .then(client => client.transactions.all({ count: 1 }))
    .then(transactions => transactions[0])

const getLastTransactionPostback = (apiKey) =>
  getLastTransaction(apiKey)
    .then(transaction => transaction.id)
    .then(id =>
      getClient(apiKey)
        .then(client => client.postbacks.find({ transactionId: id }))
    )

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('task', {
    'pagarmejs:transaction': (externalId) => getTransaction(config.env.API_KEY, externalId),
    'pagarmejs:postback': (transactionId) => getPostback(config.env.API_KEY, transactionId),
    'pagarmejs:lastTransaction': () => getLastTransaction(config.env.API_KEY),
    'pagarmejs:lastPostback': () => getLastTransactionPostback(config.env.API_KEY)
  })
}
