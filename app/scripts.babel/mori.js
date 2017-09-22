import $ from 'jquery';

const MORI = 'mrga.service-navi.jp';
const MORI_GAMEAPP = 'gameapp.galaxymatome.com';
const MORI_ARTICLES = 'http://mrga.service-navi.jp/square/articles';
const MORI_FLAG = 'mori_flag';
const MORI_READ_FLAG = 'mori_read_flag';
const MORI_LINKS_KEY = 'mori_links';

let links = [];

chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request == "mori")
	{
		set_storage(MORI_FLAG, 1);
		window.open(MORI_ARTICLES, '_blank');
	}
});

$(function(){
	//chrome.storage.local.remove(MORI_FLAG);
	//chrome.storage.local.remove(MORI_LINKS_KEY);
	chrome.storage.local.get(MORI_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}

		if (location.href == MORI_ARTICLES)
		{
			get_articles();
		}
		else if (location.href.indexOf(MORI_GAMEAPP + '/induction/') != -1)
		{
			chrome.storage.local.get(MORI_LINKS_KEY, function(value){
				if ($.isEmptyObject(value))
				{
					return false;
				}
				read_article(JSON.parse(value[MORI_LINKS_KEY]));
			});
		}
		else if (location.href.indexOf(MORI_GAMEAPP + '/article/') != -1)
		{
			$("div.button__layer").find('a')[0].click();
		}
		else
		{
			chrome.storage.local.get(MORI_READ_FLAG, function(value){
				if ($.isEmptyObject(value))
				{
					set_storage(MORI_READ_FLAG, 1);
					var url = $("div.article").find("div.article-read-more").find("a").attr('href');
					window.location.href = url;
				}
				else
				{
					chrome.storage.local.get(MORI_LINKS_KEY, function(value){
						go_article(JSON.parse(value[MORI_LINKS_KEY]))
						chrome.storage.local.remove(MORI_READ_FLAG);
					});
				}
			});
		}
	});
});


function get_articles()
{
	$("div.enquete_box").find('a').each(function(){
		var href = $(this).attr('href');
		links.push(href);
	});
	go_article(links);
}

function go_article(articles)
{
	if (articles.length <= 0)
	{
		chrome.storage.local.remove(MORI_FLAG);
		chrome.storage.local.remove(MORI_READ_FLAG);
		chrome.storage.local.remove(MORI_LINKS_KEY);
		return false;
	}
	var url = articles.shift();
	set_storage(MORI_LINKS_KEY, JSON.stringify(articles));
	window.location.href = 'http://' + MORI + url;
}

function read_article(articles)
{
	var list = $("ul.new__list").find('li')[0];
	var url = $(list).find('a').attr('href');
	window.location.href = 'http://' + MORI_GAMEAPP + url;
}

function set_storage(key, value)
{
	var entity = {};
	entity[key] = value;
	chrome.storage.local.set(entity);
}
