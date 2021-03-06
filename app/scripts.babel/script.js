import $ from 'jquery';

const REAL_WORLD = 'realworld.jp';
const REAL_LINKS_KEY = 'real_links';
const REAL_PAGE_KEY = 'real_world_page';
const REAL_WORLD_PAGE = 'http://realworld.jp/contents/rec/page/';

const MONOW_URL = 'http://www.monow.jp';
const MONOW_FLAG = 'monow_flag';

let page_num = 7;
let cnt = 0;
let links = [];

chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request == "real_world")
	{
		set_storage(REAL_PAGE_KEY, 1);
		window.open(REAL_WORLD_PAGE + "7", '_blank');
	}
});

$(function(){
	if (location.host.indexOf(REAL_WORLD) == -1)
	{
		return false;
	}
	chrome.storage.local.get(REAL_LINKS_KEY, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		read_article(JSON.parse(value[REAL_LINKS_KEY]));
	});
	chrome.storage.local.get(REAL_PAGE_KEY, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		get_real_world(value[REAL_PAGE_KEY]);
	});
});

function get_real_world(value)
{
	page_num = value;
	var a_list = $("section#recommend").find('a.clearfix.sec-recommend.able');
	$.each(a_list, function(i, val) {
		if (cnt > 5)
		{
			return false;
		}
		links.push($(val).attr('href'));
		cnt++;
	});
	if (cnt >= 5)
	{
		clear([REAL_PAGE_KEY]);
		go_article(links);
	}
	else
	{
		page_num++;
		set_storage(REAL_PAGE_KEY, page_num);
		window.location.href = REAL_WORLD_PAGE + String(page_num);
	}
}

function read_article(articles)
{
	window.scroll(0, $(document).height());
	setTimeout(function(){
		var tag = $("section#complete").find("a.modal-close");
		$(tag)[0].click();
	}, 1000);
	if (articles.length <= 0)
	{
		finish();
		return false;
	}
	setTimeout(function(){
		go_article(articles);
	}, 2000);
}

function go_article(articles)
{
	var url = articles.shift();
	set_storage(REAL_LINKS_KEY, JSON.stringify(articles));
	window.location.href = url;
}

function finish()
{
	clear([REAL_LINKS_KEY]);
	set_storage(MONOW_FLAG, 1);
	window.open(MONOW_URL, '_blank');
}

function set_storage(key, value)
{
	var entity = {};
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
