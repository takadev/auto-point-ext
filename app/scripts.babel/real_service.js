import $ from 'jquery';

const REAL_WORLD_URL = 'http://www.realworld.jp/';
const REAL_SERVICE_FLAG = 'real_service_flag';
const REAL_SERVICE_KEY = 'real_service';
const ALREADY_GET = 'www.gendama.jp';
const SHINDAN = 'shindan-apps.net';

let links = [];

$(function(){
	chrome.storage.local.get(REAL_SERVICE_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == REAL_WORLD_URL)
		{
			get_articles();
		}
		else if (location.href.indexOf(REAL_WORLD + '/services/') != -1)
		{
			let url = $("p.conv").find("a").attr('href');
			window.location.href = url;
		}
		else if (location.href.indexOf(ALREADY_GET) != -1)
		{
			chrome.storage.local.get(REAL_SERVICE_KEY, function(value){
				if ($.isEmptyObject(value))
				{
					finish();
					return false;
				}
				go_article(JSON.parse(value[REAL_SERVICE_KEY]));
			});
		}
		else if (location.href.indexOf(SHINDAN) != -1)
		{
			$("div.col-md-offset-2.col-md-8.col-lg-offset-3.col-lg-6").find('a').click();
		}
	});
});

function get_articles()
{
	$("section#main-new").find('a').each(function(){
		links.push($(this).attr('href'));
	});
	go_article(links);
}

function go_article(articles)
{
	if (articles.length <= 0)
	{
		finish();
		return false;
	}
	else
	{
		let url = articles.shift();
		set_storage(REAL_SERVICE_KEY, JSON.stringify(articles));
		window.location.href = REAL_WORLD_URL + url;
	}
}

function finish()
{
	clear([REAL_SERVICE_FLAG, REAL_SERVICE_KEY])
	//chrome.runtime.sendMessage({type:'real_service'});
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