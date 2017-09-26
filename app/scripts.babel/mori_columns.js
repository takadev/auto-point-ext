import $ from 'jquery';

const MORI_COLUMNS_URL = 'http://mrga.service-navi.jp/square/columns';
const MORI_COLUMNS_FLAG = 'mori_columns_flag';
const MORI_COLUMNS_KEY = 'mori_columns_links';
const COLUMNS_HOST = 'column-enquete-reado.com';

//const MORI_VOTE_URL = 'http://mrga.service-navi.jp/square/votes';
//const MORI_VOTE_FLAG = 'mori_vote_flag';
const GEN_RACE_URL = 'http://www.gendama.jp/race/';
const GEN_RACE_FLAG = 'gen_race_flag';


let links = [];

$(function(){
	chrome.storage.local.get(MORI_COLUMNS_FLAG, function(value)
	{
		if ($.isEmptyObject(value))
		{
			return false;
		}
		if (location.href == MORI_COLUMNS_URL)
		{
			get_articles();
		}
		else if (location.href.indexOf(COLUMNS_HOST) != -1)
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
		set_storage(MORI_COLUMNS_KEY, JSON.stringify(articles));
		window.location.href = 'http://mrga.service-navi.jp' + url;
	}
}

function answer()
{
	check();
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
			else if (type == 'image' || type == 'button')
			{
				if ($(elem).attr('value') != '戻る')
				{
					$(elem).click();
				}
			}
			else if (type == 'submit')
			{
				$(form).submit();
			}
		});
	}
	else
	{
		let bt = $("div#again_bt");
		if (bt.length)
		{
			$(bt).find('a').click();
			setTimeout(function(){
				next();
			}, 500);
		}
		else
		{
			next();
		}
	}
}

function next()
{
	chrome.storage.local.get(MORI_COLUMNS_KEY, function(value){
		if ($.isEmptyObject(value))
		{
			return false;
		}
		go_article(JSON.parse(value[MORI_COLUMNS_KEY]));
	});
}

function finish()
{
	clear([MORI_COLUMNS_FLAG, MORI_COLUMNS_KEY]);
	set_storage(GEN_RACE_FLAG, 1);
	window.open(GEN_RACE_URL, '_blank');
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