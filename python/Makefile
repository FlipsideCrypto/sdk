.PHONY: all

all: clean local_env build_wheel push_wheel

clean: clean-build clean-pyc clean-test clean-dirs
deploy: test deploy_flipside deploy_shroomdk
local: test local_flipside local_shroomdk

deploy_flipside: 
	make clean
	make setup-flipside
	make build
	make upload
	make clean

deploy_shroomdk: 
	make clean
	make setup-shroomdk
	make build
	make upload
	make clean

local_flipside:
	make clean 
	make setup-flipside 
	make local-install 
	make clean

local_shroomdk: 
	make clean 
	make setup-shroomdk 
	make local-install 
	make clean

clean-build:
	rm -fr build/
	rm -fr dist/
	rm -fr .eggs/
	find . -name '*.egg-info' -exec rm -fr {} +
	find . -name '*.egg' -exec rm -f {} +

clean-pyc:
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +

clean-test:
	rm -fr .tox/
	rm -f .coverage
	rm -fr htmlcov/

clean-dirs:
	rm -fr flipside/
	rm -fr shroomdk/
	rm -rf package_name.txt

test:
	pytest

build:
	python3 setup.py sdist bdist_wheel

setup-shroomdk:
	mkdir shroomdk
	cp -R ./src/* ./shroomdk
	echo "shroomdk-chaos" > package_name.txt

setup-flipside:
	mkdir flipside
	cp -R ./src/* ./flipside
	echo "flipside" > package_name.txt

local-install:
	python setup.py install

upload:
	twine upload dist/* --verbose
