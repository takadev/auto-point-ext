import $ from 'jquery';

const MORI = 'mrga.service-navi.jp';
const MORI_GAMEAPP = 'gameapp.galaxymatome.com';
const MORI_ARTICLES = 'http://mrga.service-navi.jp/square/articles';
const MORI_FLAG = 'mori_flag';
const MORI_READ_FLAG = 'mori_read_flag';
const MORI_LINKS_KEY = 'mori_links';
const MORI_BONUS_KEY = 'mori_bonus';

const MORI_SURVEYS_URL = 'http://mrga.service-navi.jp/square/surveys';
const MORI_SURVEYS_FLAG = 'mori_surveys_flag';

let links = [];

$(function(){
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
			if (location.href.indexOf('/bonus/') != -1)
			{
				set_storage(MORI_READ_FLAG, 1);
				$("a.entrance__button.ad_article")[0].click();
			}
			else
			{
				$("form#article-jump").submit();
			}
		}
		else
		{
			chrome.storage.local.get(MORI_READ_FLAG, function(value){
				if ($.isEmptyObject(value))
				{
					set_storage(MORI_READ_FLAG, 1);
					let url = $("div.article").find("div.article-read-more").find("a").attr('href');
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
		let href = $(this).attr('href');
		links.push(href);
	});
	go_article(links);
}

function go_article(articles)
{
	if (articles.length <= 0)
	{
		chrome.storage.local.get(MORI_BONUS_KEY, function(value){
			if ($.isEmptyObject(value))
			{
				finish();
				return false;
			}
			else
			{
				let bonus = value[MORI_BONUS_KEY];
				clear([MORI_BONUS_KEY]);
				alert(bonus);
				console.log(bonus);
				if (bonus != undefined) {
					window.location.href = 'http://' + MORI_GAMEAPP + bonus;
				} else {
					finish();
					return false;
				}
			}
		});
	}
	else
	{
		let url = articles.shift();
		set_storage(MORI_LINKS_KEY, JSON.stringify(articles));
		window.location.href = 'http://' + MORI + url;
	}
}

function read_article(articles)
{
	chrome.storage.local.get(MORI_BONUS_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			let list = $("ul.new__list").find('li')[1];
			let a_tag = $(list).find('a');
			let text = a_tag.text();
			if (text.indexOf('ボーナス') != -1)
			{
				set_storage(MORI_BONUS_KEY, $(a_tag).attr('href'));
			}
		}
	});
	let list = $("ul.new__list").find('li')[0];
	let url = $(list).find('a').attr('href');
	window.location.href = 'http://' + MORI_GAMEAPP + url;
}

function finish()
{
	clear([MORI_FLAG, MORI_READ_FLAG, MORI_LINKS_KEY]);
	set_storage(MORI_SURVEYS_FLAG, 1);
	window.open(MORI_SURVEYS_URL, '_blank');
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