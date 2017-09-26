import $ from 'jquery';

const GEN_HOST = 'www.gendama.jp';
const GEN_RACE_URL = 'http://www.gendama.jp/race/';
const GEN_RACE_FLAG = 'gen_race_flag';

let links = [];

$(function(){
	chrome.storage.local.get(GEN_RACE_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == GEN_RACE_URL)
		{
			get_articles();
		}
	});
});

function get_articles()
{
	let a_tag;
	setTimeout(function(){
		a_tag = $("p#race_simple05_btn").find('a');
		$(a_tag)[0].click();
	}, 1000);
	setTimeout(function(){
		a_tag = $("p#race_simple05_failure_btn").find('a');
		$(a_tag)[0].click();
	}, 1000);

	setTimeout(function(){
		a_tag = $("p#race_simple01_btn").find('a');
		$(a_tag)[0].click();
	}, 1000);

	setTimeout(function(){
		a_tag = $("p#race_simple02_btn").find('a');
		$(a_tag)[0].click();
		finish();
	}, 1000);
}

function finish()
{
	clear([GEN_RACE_FLAG]);
}

function set_storage(key, value)
{
	let entity = {};
	entity[key] = value;
	chrome.storage.local.set(entity);
}

function clear(keys)
{
	for(var i = 0; i < keys.length; i++)
	{
		chrome.storage.local.remove(keys[i]);
	}
}