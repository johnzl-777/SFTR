

const nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')

//Generate public/private key pair
/* Person A*/
const keys_a = nacl.box.keyPair()
/* Person B*/
const keys_b = nacl.box.keyPair()

// one time nonce for encryption
const nonce = nacl.randomBytes(24)
// Test IPFS hash 
const ipfs_hash = 'QmQpijfDCy35wkEmysJWPWT8h45tk1Pkam6UXf14XZ7UJo'
// Person A encrypts IPFS string for Person B
const box = nacl.box(
	nacl.util.decodeUTF8(ipfs_hash),
	nonce, 
	keys_b.publicKey, //Person B public key, accessible via contract
	keys_a.secretKey  //Person A private key, 
)


const message = {box, nonce};


