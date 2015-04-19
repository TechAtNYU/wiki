<?php
if (!defined('MEDIAWIKI')){
	die();
}

class HeaderScriptInjector {

	
	var $libs = array();
	var $scripts = array();
	var $styles = array();
	var $google_api_key;
	var $cdn_list = array('google');
	var $google_api_loaded = false;

	function loadLib($lib,$cdn,$ver){
		if (in_array($lib,$this->libs)){
			return;
		}
		else {
			$this->libs[] = $lib;
			if ($cdn == 'google'){
				$this->loadGoogleApi();
				$this->addJSContent('google.load("'.$lib. '","' . $ver . '");');
			}
			else {
				throw new MWException("unsupported content distribution network (CDN): '$cdn'."
					." Valid CDN list: " . implode(", ",$this->cdn_list) . ".");
			}
		}
	}

	function loadGoogleApi(){
		global $wgGoogleApiKey,$wgOut;
		if ($this->google_api_loaded == true){
			return;
		}
		if ($wgGoogleApiKey == ''){
			throw new MWException("please get Google API Key and set it with "
				."\$wgGoogleApiKey variable in LocalSettings.php file");
		}
		$wgOut->addScript('<script src="http://www.google.com/jsapi?key=' .
		                                $wgGoogleApiKey. '" type="text/javascript"></script>'."\n");
		$this->google_api_loaded = true;
	}

	function addJSContent($content){
		global $wgOut;
		$wgOut->addScript('<script type="text/javascript">' . $content . '</script>'. "\n");
	}

	function addScript($url){
		global $wgOut;
		if (in_array($url,$this->scripts)){
			return;
		}
		else {
			$this->scripts[] = $url;
			$wgOut->addScript('<script type="text/javascript" src="' . $url . '"></script>'."\n");
		}
	}

	function addCSS($url){
		global $wgOut;
		if (in_array($url,$this->styles)){
			return;
		}
		else {
			$this->styles[] = $url;
			$wgOut->addScript('<link rel="stylesheet" type="text/css" href="'.$url.'"></link>'."\n");
		}
	}
}

global $wgHeader;
$wgHeader = new HeaderScriptInjector();
global $wgGoogleApiKey;
$wgGoogleApiKey = '';
?>
