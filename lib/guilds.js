"use strict"
const _ = require('lodash');
const gw2api = require('gw2api');

const cache = require('./cache');





/*
*
*   DEFINE EXPORT
*
*/

let Controller = {};
var __guildMap = {};
module.exports = Controller;

const __INSTANCE = {
	cacheTime: (1000 * 60 * 60 * 24),
	// cacheTime: (1000 * 10)
};



/*
*
*   PUBLIC METHODS
*
*/



Controller.getById = function(guildId, cbGetter){
	cache.get(
		guildId,
		__INSTANCE.cacheTime,
		function(fallbackCallback){
			gw2api.getGuildDetails({guild_id: guildId}, fallbackCallback)
		},
		function(err, data){
			if(data && data.guild_name){
				__guildMap[data.guild_name.toLowerCase()] = data.guild_id;
				__saveGuildMap();
			}
			cbGetter(err, data);
		}
	);
};


Controller.getByName = function(guildName, cbGetter){
	let lowerGuildName = guildName.toLowerCase();

	if(__guildMap.hasOwnProperty(lowerGuildName)){
		Controller.getById(__guildMap[lowerGuildName], cbGetter);
	}
	else{
		gw2api.getGuildDetails({guild_name: lowerGuildName}, function(err, data){
			if(data && data.guild_name){
				__guildMap[lowerGuildName] = data.guild_id;
				__saveGuildMap();
				cache.put(data.guild_id, data, cbGetter.bind(null, err, data));
			}
			else{
				cbGetter('NOTFOUND', {})
			}
		});
		
	}
};




/*
*
*   PRIVATE METHODS
*
*/

/*
*	GUILD MAP
*/

(function __setGuildMap(){
	__loadGuildMap(function(err, data){
		if(!data){
			__saveGuildMap();
		}
		else{
			__guildMap = data;
		}
	});
}())


function __loadGuildMap(cbGetter){
	cache.get(
		'guildMap',
		null,
		function(fallbackCallback){
			fallbackCallback(null, {})
		},
		cbGetter
	);
}


function __saveGuildMap(){
	console.log('storing current guild map');
	cache.put('guildMap', __guildMap, _.noop)
}