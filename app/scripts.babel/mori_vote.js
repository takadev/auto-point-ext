import $ from 'jquery';

const MORI_VOTE_URL = 'http://mrga.service-navi.jp/square/votes';
const MORI_VOTE_FLAG = 'mori_vote_flag';
const MORI_VOTE_KEY = 'mori_vote_links';
const MORI_VOTE_NUM = 'mori_vote_num';
const VOTE_HOST = 'vote.media-ad.jp';
const DECISION_HOST = "mrga.decision-four.xyz";

let links = [];

$(function(){
	chrome.storage.local.get(MORI_VOTE_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == MORI_VOTE_URL)
		{
			set_storage(MORI_VOTE_NUM, 0);
			get_articles();
		}
		else if (location.href.indexOf(VOTE_HOST) != -1)
		{
			start();
		}
		else if (location.href.indexOf(DECISION_HOST) != -1)
		{
			check();
		}
	});
});

function get_articles()
{
	$("div.enquete_box").find('a').each(function(){
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
		set_storage(MORI_VOTE_KEY, JSON.stringify(articles));
		window.location.href = url;
	}
}

function start()
{
	$("div.start__inner").find('a').each(function(){
		if ($(this).attr('class') == 'start__button')
		{
			window.location.href = $(this).attr('href');
		}
	});
}

function check()
{
	let radio = false;
	let checkbox = false;
	let form = $('form')
	let select = $(form).find('select');
	if (select.length)
	{
		let value;
		$(select).find('option').each(function(i, elem){
			value = $(elem).attr('value');
			if (value != '') {
				return false;
			}
		});
		$(select).val(value);
	}
	let input = $(form).find('input');
	if (input.length)
	{
		input.each(function(i, elem){
			let type = $(elem).attr('type');
			if (type == 'radio' && radio == false)
			{
				$(elem).prop('checked', true);
				radio = true;
			}
			else if (type == 'checkbox' && checkbox == false)
			{
				$(elem).prop("checked", true);
				checkbox = true;
			}
			else if (type == 'button' || type == 'submit')
			{
				$(elem).click();
			}
		});
	}
	else
	{
		chrome.storage.local.get(MORI_VOTE_NUM, function(value){
			if ($.isEmptyObject(value))
			{
				return false;
			}
			if (value[MORI_VOTE_NUM] > 50)
			{
				finish();
			}
			else
			{
				set_storage(MORI_VOTE_NUM, value[MORI_VOTE_NUM]++);
				window.location.href = 'http://' + DECISION_HOST + '/question/random';
			}
		});
	}
}

function next()
{
	chrome.storage.local.get(MORI_VOTE_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			return false;
		}
		go_article(JSON.parse(value[MORI_VOTE_KEY]));
	});
}

function finish()
{
	clear([MORI_VOTE_FLAG, MORI_VOTE_KEY])
	window.close();
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