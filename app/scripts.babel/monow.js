import $ from 'jquery';

const MONOW_URL = 'http://www.monow.jp/';
const MONOW_FLAG = 'monow_flag';
const MONOW_LINKS_KEY = 'monow_links';

const MORI_FLAG = 'mori_flag';
const MORI_READ_URL = 'http://mrga.service-navi.jp/square/articles';

let links = [];

$(function(){
	chrome.storage.local.get(MONOW_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}

		if (location.href == MONOW_URL)
		{
			get_articles();
		}
		else if (location.href.indexOf('/detail/') != -1)
		{
			read_article();
		}
	});
});

function get_articles()
{
	$("ul#timeline").find('a').each(function(){
		let url = $(this).attr('href');
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
		finish();
		return false;
	}
	else
	{
		let url = articles.shift();
		set_storage(MONOW_LINKS_KEY, JSON.stringify(articles));
		window.location.href = MONOW_URL + url;
	}
}

function read_article()
{
	let a_tag = $("a.monowBt_point");
	if (a_tag.length)
	{
		$(a_tag)[0].click();
	}
	chrome.storage.local.get(MONOW_LINKS_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			return false;
		}
		go_article(JSON.parse(value[MONOW_LINKS_KEY]));
	});
}

function finish()
{
	clear([MONOW_FLAG, MONOW_LINKS_KEY]);
	set_storage(MORI_FLAG, 1);
	window.open(MORI_READ_URL, '_blank');
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