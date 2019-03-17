const pmc = require('@lemonce3/pmc/src');
const events = require('@lemonce3/event-constructor/src');
const agentWindow = require('../window');
const frame = require('../frame');
const utils = require('../utils');
const _ = require('underscore');

const isHTML5 = !!window.File;
const uploading = {
	element: null,
	form: null,
};

if (utils.isIE8) {
	overrideUploadIE8();
} else {
	overrideUpload();
}

function setUploading(element = null) {
	uploading.element = element;
	uploading.form = element || element.form;

	return pmc.request(window.top, 'upload.state.update', !!element);
}

(function overridePrototype() {
	const _click = HTMLInputElement.prototype.click;
	
	HTMLInputElement.prototype.click = function mockClick() {
		if (frame.testing && this.type === 'file') {
			return setUploading(this);
		}
		
		return _click.call(this);
	};
}());

function overrideUpload() {
	window.addEventListener('click', function (event) {
		const {target} = event;

		if (frame.testing && target && target.type === 'file') {
			event.preventDefault();
			setUploading(target);
		}
	});
}

function overrideUploadIE8() {
	window.attachEvent('onclick', function (event) {
		const target = event.srcElement;

		if (frame.testing && target && target.type === 'file') {
			event.returnValue = false;
			setUploading(target);
		}
	});
}

function createHiddenInput(element, fileNameList) {
	const input = document.createElement('input');

	input.setAttribute('type', 'hidden');
	input.setAttribute('name', `_mock_${element.name}`);
	input.value = fileNameList.toString();

	return input;
}

function createChangeEvent() {
	return new events.UIEvent('change', { bubbles: false, cancelable: true });
}

function MockFile(blob, name) {
	blob.name = name;
	blob.lastModified = Date.now();
	blob.lastModifiedDate = new Date();

	return blob;
}

function MockFileList(fileList) {
	fileList.item = function (index) {
		return fileList[index];
	};

	return fileList;
}

let uploadSource = null;

agentWindow.program('window.upload', function (fileOptionList) {
	return pmc.request(uploadSource, 'upload.file.onload', fileOptionList);
});

if (top === self) {
	pmc.on('upload.state.update', function (pending, source) {
		return new utils.Promise(function (resolve) {
			agentWindow.nextTick(function (windowData) {
				windowData.upload.pending = pending;
		
				if (!pending) {
					uploadSource = null;
				} else {
					uploadSource = source;
				}

				resolve();
			});
		});
	});
}

pmc.on('upload.file.onload', function (fileOptionList) {
	const uploadElement = uploading.element;
	
	if (uploadElement === null) {
		throw new Error('No upload task pending.');
	}
	
	const fileNameList = _.map(fileOptionList, function (options) {
		return options.name;
	});
	
	if (uploading.form !== null) {
		uploading.form.appendChild(createHiddenInput(uploadElement, fileNameList));
	}

	if (isHTML5) {
		return utils.Promise.all(fileOptionList.map(options => {
			return utils.http('get', `/api/file/${options.hash}`, {
				type: 'blob'
			});
		})).then(blobList => {
			const mockFileList = new MockFileList(blobList.map((blob, index) => {
				return new MockFile(blob, fileOptionList[index].name);
			}));
	
			Object.defineProperty(uploadElement, 'files', {
				value: mockFileList
			});

			return endUploading();
		});
	} else {
		return endUploading();
	}

	function endUploading() {
		uploadElement.dispatchEvent(createChangeEvent());
		return setUploading();
	}
});