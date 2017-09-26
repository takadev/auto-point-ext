import $ from 'jquery';

const MORI_DIAGNOSES_URL = 'http://mrga.service-navi.jp/square/diagnoses';
const MORI_DIAGNOSES_FLAG = 'mori_diagnoses_flag';
const MORI_DIAGNOSES_KEY = 'mori_diagnoses_links';
const CREDIT_LINK = 'credit-card.link';

const MORI_PITTAN_URL = 'http://mrga.service-navi.jp/square/pittango';
const MORI_PITTAN_FLAG = 'mori_pittan_flag';

let links = [];
let timer;

$(function(){
	chrome.storage.local.get(MORI_DIAGNOSES_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == MORI_DIAGNOSES_URL)
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
		set_storage(MORI_DIAGNOSES_KEY, JSON.stringify(articles));
		window.location.href = url;
	}
}

function answer()
{
	timer = setInterval(function(){
		check();
	}, 300)
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
		next();
	}
}

function next()
{
	clearInterval(timer);
	chrome.storage.local.get(MORI_DIAGNOSES_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			return false;
		}
		go_article(JSON.parse(value[MORI_DIAGNOSES_KEY]));
	});
}

function finish()
{
	clear([MORI_DIAGNOSES_FLAG, MORI_DIAGNOSES_KEY]);
	set_storage(MORI_PITTAN_FLAG, 1);
	window.open(MORI_PITTAN_URL, '_blank');
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