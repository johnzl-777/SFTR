//Get IPFS library
const IPFS = require('ipfs-http-client')

//Create node object
const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

//Get Node Version
node.on('ready', async() => {
	const version = await node.version()

	console.log('Version:', version.version)

	const filesAdded = await node.add({
		path: 'hello.text', 
		content: Buffer.from('Hello World 101')
	})

	console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)

	const fileBuffer = await node.cat(filesAdded[0].hash)

	console.log('Added file contents:', fileBuffer.toString())
})

