import $ from 'jquery';

const MORI = 'mrga.service-navi.jp';
const GEN_SURVEYS_URL = 'http://www.gendama.jp/survey';
const GEN_SURVEYS_FLAG = 'gen_surveys_flag';
const GEN_SURVEYS_KEY = 'gen_surveys_links';
const EC_LINK = 'ec-bought.com';
const MINI_LINK = 'mini.surveyenquete.net';
const INFO_LINK = 'infopanel.asia';
const INFO_JP_LINK = 'infopanel.jp';
const CI_SURVEY_LINK = 'ci.surveyenquete.net';

const MORI_VOTE_URL = 'http://mrga.service-navi.jp/square/votes';
const MORI_VOTE_FLAG = 'mori_vote_flag';

let links = [];

$(function(){
	chrome.storage.local.get(GEN_SURVEYS_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == GEN_SURVEYS_URL)
		{
			get_articles();
		}
		else if (location.href.indexOf(EC_LINK) != -1 ||
			location.href.indexOf(MINI_LINK) != -1 ||
			location.href.indexOf(INFO_LINK) != -1 ||
			location.href.indexOf(INFO_JP_LINK) != -1)
		{
			answer();
		}
		else if (location.href.indexOf(CI_SURVEY_LINK) != -1)
		{
			next();
		}
		else
		{
			finish();
		}
	});
});

function get_articles()
{
	$("li.clearfix").find('a').each(function(){
		let url = $(this).attr('href');
		if (url.indexOf('gmostart') != -1)
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
	let url = articles.shift();
	set_storage(GEN_SURVEYS_KEY, JSON.stringify(articles));
	window.location.href = url;
}

function answer()
{
	check();
}

function check()
{
	let radio = false;
	let checkbox = false;
	let form = $('form');
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
		console.log(input.length);
		input.each(function(i, elem){
			let type = $(elem).attr('type');
			if (type == 'radio' && radio == false)
			{
				$(elem).prop('checked',true);
				radio = true;
			}
			else if (type == 'checkbox' && checkbox == false)
			{
				$(elem).prop("checked",true);
				checkbox = true;
			}
			else if (type == 'button' || type == 'submit')
			{
				$(elem).click();
			}
		});
	}
	let button = $(form).find('button');
	if (button.length)
	{
		$(button).click();
	}
	else
	{
		next();
	}
}

function next()
{
	chrome.storage.local.get(GEN_SURVEYS_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			return false;
		}
		go_article(JSON.parse(value[GEN_SURVEYS_KEY]));
	});
}

function finish()
{
	clear([GEN_SURVEYS_FLAG, GEN_SURVEYS_KEY]);
	set_storage(MORI_VOTE_FLAG, 1);
	window.open(MORI_VOTE_URL, '_blank');
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