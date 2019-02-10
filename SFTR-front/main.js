var $ = require('jquery');
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
const IPFS = require('ipfs-http-client');

const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const contract_abi = [{"constant":false,"inputs":[{"name":"in_public_key","type":"uint8[]"}],"name":"set_pubkey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xa01815a2"},{"constant":true,"inputs":[{"name":"in_public_address","type":"address"}],"name":"get_pubkey","outputs":[{"name":"","type":"uint8[]"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x6147c8ab"},{"constant":false,"inputs":[{"name":"receiver_address","type":"address"},{"name":"box","type":"uint8[]"},{"name":"nonce","type":"uint8[]"}],"name":"send_data","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x1a78a74f"},{"constant":true,"inputs":[],"name":"get_data","outputs":[{"name":"sender_addres","type":"address"},{"name":"","type":"uint8[]"},{"name":"","type":"uint8[]"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x50bf8b0d"}];
const contract_addr = "0x1045fFd2820817EEcb9b09102b4A5AE44A2d55Cc";
var contract_inst = web3.eth.contract(contract_abi).at(contract_addr);

var public_key_store;

function gen_keys()
{
	key_data = nacl.box.keyPair();
	public_key_store = key_data.publicKey;
	$("#pubkey_out").text(key_data.publicKey.toString());
	$("#privkey_out").text(key_data.secretKey.toString());
}

function push_pub_key()
{
	contract_inst.set_pubkey(Array.from(public_key_store), (err, res) => {
		if(!err)
			console.log(res);	
		else	
			console.log(err);	
	});
}

function get_pub_key(address_in)
{
	return new Promise((resolve, reject) =>
	{
		contract_inst.get_pubkey(address_in,(err, res) =>
		{
			if(!err)
			{
				resolve(res);
			}
			else
			{
				console.log(err)
				reject(err);
			}
		});
	});
}

function ipfs_upload(buffer) 
{
  return new Promise(function(resolve, reject) 
  {
    ipfs.add(buffer, (err, out_hash) => 
    {
      if (err) 
      {
        console.log(err);
        reject(err);
      } 
      else 
      {
        let res = out_hash[0].hash;
        resolve(res);
      }
    });
  });
}

function upload_file()
{

	//Get Public Key
	var address_in = $("#addr_in").val();
	var converted_pub_key = [];
	var pub_key_raw = get_pub_key(address_in);
	pub_key_raw.then((result) => 
		{
			for(var i = 0; i < result.length; ++i)
			{
				converted_pub_key.push(result[i].c[0]);
			}
			converted_pub_key = new Uint8Array(converted_pub_key);
		}
		, (err) => 
		{
			console.log(err);
		});
	
	//Get Private Key
	var priv_key_in = new Uint8Array(JSON.parse("[" + $("#private_in_upload").val() + "]"));
	//Get File
	var file_in = $("#file_in")[0].files[0];
	//Get Hash
	var ipfs_hash;
	const reader = new FileReader();
	reader.readAsArrayBuffer(file_in);
	reader.onloadend = async () =>
	{
		const buffer = await Buffer.from(reader.result);
		const ipfs_hash = await ipfs_upload(buffer);

		//Get sender's public key
		const sender_pub_key = nacl.box.keyPair.fromSecretKey(priv_key_in);
		//Generate Nonce
		const nonce = nacl.randomBytes(24);
		//Encrypt message
		const box = nacl.box(
			//Hash as list of numbers
			nacl.util.decodeUTF8(ipfs_hash),
			//Random bytes
			nonce,
			//Public Key of receiver
			converted_pub_key,
			//Privatge key of sender
			priv_key_in
			);

		contract_inst.send_data(address_in, Array.from(box), Array.from(nonce), (err, res) =>
		{
			if(!err)
			{
				console.log(res);
			}
			else
			{
				console.log(err);
			}
		});
	}

}

function get_contract_data()
{
	return new Promise((resolve, reject) =>
	{
		contract_inst.get_data((err, res)=>
		{
			if(!err)
			{
				resolve(res);
			}
			else
			{
				console.log(err);
				reject(err);
			}
		});
	});
}

function download_file()
{
	var priv_key_in = new Uint8Array(JSON.parse("[" + $("#private_in_download").val() + "]"));
	var sender_pub_key = [];
	var box = [];
	var nonce = [];

	//Get nonce and box
	var retrieved_data = get_contract_data()
	retrieved_data.then((result) =>
	{
		console.log(result);
		var pub_key_raw = get_pub_key(result[0]);
		pub_key_raw.then((result) => 
			{
				for(var i = 0; i < result.length; ++i)
				{
					sender_pub_key.push(result[i].c[0]);
				}
				
			}
			, (err) => 
			{
				console.log(err);
			});

		for(var i = 0; i < result[1].length; ++i)
		{
			box.push(result[1][i].c[0]);
		}
		

		for(var i = 0; i < result[2].length; ++i)
		{
			nonce.push(result[2][i].c[0]);
		}
		
	},
	(err) =>
	{
		console.log(err);
	});

	//Decrypt hash
	//Need senders public key
	for(var i = 0; i < box.length; ++i)
	{
		console.log(box[i]);
	}
	box = new Uint8Array(box);
	nonce = new Uint8Array(nonce);
	sender_pub_key = new Uint8Array(sender_pub_key);
	priv_key_in = new Uint8Array(priv_key_in);
	console.log(box);
	console.log(nonce);
	console.log(sender_pub_key);
	console.log(priv_key_in);
	const payload = nacl.box.open(box, nonce, sender_pub_key, priv_key_in);
	console.log(nacl.util.decodeUTF8(payload));

}



$(document).ready(function() {
	$("#btn_gen_key").click(function() {gen_keys()});
	$("#btn_pub_key").click(function() {push_pub_key()});
	$("#btn_submit").click(function() {upload_file()});
	$("#btn_download").click(function() {download_file()});
} );

