import $ from 'jquery';

const MORI = 'mrga.service-navi.jp';
const MORI_SURVEYS_URL = 'http://mrga.service-navi.jp/square/surveys';
const MORI_SURVEYS_FLAG = 'mori_surveys_flag';
const MORI_SURVEYS_KEY = 'mori_surveys_links';
const CREDIT_LINK = 'credit-card.link'

const MORI_DIAGNOSES_URL = 'http://mrga.service-navi.jp/square/diagnoses';
const MORI_DIAGNOSES_FLAG = 'mori_diagnoses_flag';

let links = [];
let timer;

$(function(){
	chrome.storage.local.get(MORI_SURVEYS_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == MORI_SURVEYS_URL)
		{
			get_articles();
		}
		else if (location.href.indexOf(CREDIT_LINK) != -1)
		{
			answer();
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
		finish();
		return false;
	}
	else
	{
		let url = articles.shift();
		set_storage(MORI_SURVEYS_KEY, JSON.stringify(articles));
		window.location.href = 'http://' + MORI + url;
	}
}

function answer()
{
	timer = setInterval(function(){
		check();
	}, 1000)
}

function check()
{
	let radio = false;
	let checkbox = false;

	setTimeout(function(){
		let iframe = $('iframe');
		let form = $(iframe).contents().find('form');
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
					$(elem).prop('checked',true);
					radio = true;
				}
				else if (type == 'checkbox' && checkbox == false)
				{
					$(elem).prop("checked",true);
					checkbox = true;
				}
				else if (type == 'submit')
				{
					$(elem).click();
				}
			});
		}
		else
		{
			next();
		}
	}, 500);
}

function next()
{
	clearInterval(timer);
	chrome.storage.local.get(MORI_SURVEYS_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			return false;
		}
		go_article(JSON.parse(value[MORI_SURVEYS_KEY]));
	});
}

function finish()
{
	clear([MORI_SURVEYS_FLAG, MORI_SURVEYS_KEY]);
	set_storage(MORI_DIAGNOSES_FLAG, 1);
	window.open(MORI_DIAGNOSES_URL, '_blank');
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