import $ from 'jquery';

const GEN_HOST = 'www.gendama.jp';
const GEN_FOREST_POPUP = 'http://www.gendama.jp/forest/popup_forest';
const GEN_FOREST_URL = 'http://www.gendama.jp/forest/';
const GEN_FOREST_FLAG = 'gen_forest_flag';
const GEN_FOREST_KEY = 'gen_forest_links';
const GEN_AD_FLAG = 'gen_ad_flag';

const GEN_SURVEYS_URL = 'http://www.gendama.jp/survey';
const GEN_SURVEYS_FLAG = 'gen_surveys_flag';

let links = [];

$(function(){
	chrome.storage.local.get(GEN_AD_FLAG, function(value)
	{
		clear([GEN_AD_FLAG]);
		next();
	});
	chrome.storage.local.get(GEN_FOREST_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == GEN_FOREST_URL)
		{
			get_articles();
		}
		else if (location.href == GEN_FOREST_POPUP)
		{
			finish();
		}
	});
});

function get_articles()
{
	$("div#pickupBox").find('a').each(function(){
		let url = 'http://' + GEN_HOST + $(this).attr('href');
		if ($.inArray(url, links) == -1)
		{
			links.push(url);
		}
	});
	$.each($("div.osusume_box"), function(){
		let url = 'http://' + GEN_HOST + $(this).find('a').attr('href');
		if ($.inArray(url, links) == -1)
		{
			links.push(url);
		}
	});
	$.each($("div.div_left"), function(){
		let url = 'http://' + GEN_HOST + $(this).find('a').attr('href');
		if ($.inArray(url, links) == -1)
		{
			links.push(url);
		}
	});
	go_article(links);
}

function go_article(articles)
{
	if (articles.length <= 0)
	{
		window.open(GEN_FOREST_POPUP);
		return false;
	}
	else
	{
		let url = articles.shift();
		set_storage(GEN_FOREST_KEY, JSON.stringify(articles));
		set_storage(GEN_AD_FLAG, 1);
		window.location.href = url;
	}
}

function next()
{
	chrome.storage.local.get(GEN_FOREST_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			return false;
		}
		go_article(JSON.parse(value[GEN_FOREST_KEY]));
	});
}

function finish()
{
	clear([GEN_FOREST_FLAG, GEN_FOREST_KEY]);
	set_storage(GEN_SURVEYS_FLAG, 1);
	window.open(GEN_SURVEYS_URL, '_blank');
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