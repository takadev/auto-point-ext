
const REAL_WORLD = 'realworld.jp';
const MORI = 'mrga.service-navi.jp';

chrome.browserAction.onClicked.addListener(function(tab)
{
	if (tab.url.indexOf(REAL_WORLD) != -1)
	{
		chrome.tabs.sendMessage(tab.id, 'real_world');
	}
	else if (tab.url.indexOf(MORI) != -1)
	{
		chrome.tabs.sendMessage(tab.id, 'mori');
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	var message = request.type;
	if (message == '')
	{
		
	}
});