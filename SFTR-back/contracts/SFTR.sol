pragma solidity ^0.5.0;

contract SFTR
{
	struct encrypted_data
	{
		uint8[] box;
		uint8[] nonce;
		address sender;
	}

	mapping(address => uint8[]) pub_keys;
	mapping(address => encrypted_data) data_store;

	function set_pubkey(uint8[] memory in_public_key) public
	{
		pub_keys[msg.sender] = in_public_key;
	}

	function get_pubkey(address in_public_address) view public returns (uint8[] memory)
	{
		return pub_keys[in_public_address];
	}

	function send_data(address receiver_address, uint8[] memory box, uint8[] memory nonce) public
	{
		encrypted_data memory tmp;
		tmp.box = box;
		tmp.nonce = nonce;
		tmp.sender = msg.sender;
		data_store[receiver_address] = tmp;
	}

	function get_data() view public returns (address sender_addres, uint8[] memory, uint8[] memory)
	{
		return (data_store[msg.sender].sender, data_store[msg.sender].box, data_store[msg.sender].nonce);
	}
}
