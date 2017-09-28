import $ from 'jquery';

const MORI_DIAGNOSES_URL = 'http://mrga.service-navi.jp/square/diagnoses';
const MORI_DIAGNOSES_FLAG = 'mori_diagnoses_flag';
const MORI_DIAGNOSES_KEY = 'mori_diagnoses_links';
const CREDIT_LINK = 'credit-card.link';
const SYOUHISYA_LINK = 'syouhisya-kinyu.com';

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
		else if (location.href.indexOf(SYOUHISYA_LINK) != -1)
		{
			//next();
			syouhisya_answer();
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
	}, 1000)
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

function syouhisya_answer()
{
	syouhisya_check();
}

function syouhisya_check()
{
	let form = $('form');
	let index = 1;
	while(true)
	{
		let radio = false;
		let checkbox = false;
		let group_tag = $("div#group-" + String(index));
		if (group_tag.length <= 0) {
			break;
		}
		$(group_tag).removeClass('dia-invisible');
		let inputs = $(group_tag).find('input');

		inputs.each(function(i, elem){
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
		index++;
	}

	$("div.col-md-offset-2").find('a').each(function(){
		if ($(this).text().indexOf('次') != -1)
		{
			$(this)[0].click();
		}
	});

	$("div.actionBar").find('a').each(function(){
		let text = $(this).text();
		if (text.indexOf('次') != -1 ||
			text.indexOf('終了') != -1)
		{
			$(this).css({'display':''});
			$(this)[0].click();
		}
	});

	setTimeout(function(){
		let buttons = $('span#end-btn-area').find('button');
		$(buttons).removeAttr('disabled');
		let param = get_param();
		$.ajax({
			url: 'http://syouhisya-kinyu.com/agw3/send',
			type: 'post',
			data: {
				"uid": '1365948',
				"cid": String(param['cid']),
				'_token': $("#_token").val(),
				'g-recaptcha-response': $('#g-recaptcha-response').val(),
				'dia_id': Number(param['cid'])
			},
			async: false,
			dataType: 'json',
			complete: function(){
				console.log('COMP');
			}
		});
		//$(buttons)[0].click();
		next();
	}, 1500);
}

function get_param()
{
	let url = location.href;
	let params = url.split("?");
	let sp_params = params[1].split("&");

	var param_arr = [];
	for (var i = 0; i < sp_params.length; i++) {
		let vol = sp_params[i].split("=");
		param_arr.push(vol[0]);
		param_arr[vol[0]] = vol[1];
	}
	return param_arr;
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