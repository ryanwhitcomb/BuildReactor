require.config({
	baseUrl: 'src',
	paths: {
		jquery: '../lib/jquery/jquery',
		signals: '../lib/js-signals/signals',
		has: '../lib/requirejs/has',
		urljs: '../lib/urljs/url-min'
	},
	shim: {
		urljs: { exports: 'URL' }
	},
	hbs: {
		helperDirectory: 'templates/helpers/',
		i18nDirectory:   'templates/i18n/'
	}
});
require([
	'serviceController',
	'notificationController',
	'badgeController',
	'settingsStore',
	'serviceTypesRepository',
	'bamboo/buildService',
	'cctray/buildService',
	'jenkins/buildService',
	'cruisecontrol/buildService',
	'cruisecontrol.rb/buildService',
	'backgroundLogger'
], function (
	serviceController,
	notificationController,
	badgeController,
	settingsStore,
	serviceTypesRepository,
	BambooService,
	CctrayService,
	JenkinsService,
	CruiseControlService,
	CruiseControlRBService,
	backgroundLogger) {

	'use strict';

	function onMessage(request, sender, sendResponse) {
		switch (request.name) {
		case 'initOptions':
			sendResponse({
				settings: settingsStore.getAll(),
				serviceTypes: serviceTypesRepository.getAll()
			});
			break;
		case 'updateSettings':
			settingsStore.store(request.settings);
			serviceController.load(request.settings).addOnce(function () {
				serviceController.run();
				sendResponse({
					name: 'settingsSaved'
				});
			});
			break;
		}
	}

	chrome.extension.onMessage.addListener(onMessage);
	backgroundLogger();
	badgeController();
	notificationController();
	serviceTypesRepository.clear();
	serviceTypesRepository.register(BambooService);
	serviceTypesRepository.register(CctrayService);
	serviceTypesRepository.register(JenkinsService);
	serviceTypesRepository.register(CruiseControlService);
	serviceTypesRepository.register(CruiseControlRBService);
	var settings = settingsStore.getAll();
	serviceController.load(settings).addOnce(function () {
		serviceController.run();
	});
});
