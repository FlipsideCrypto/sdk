VER := $(shell head -n 1 VERSION)
NEXT_VER := $(shell ../bin/semver bump minor $(VER))

.PHONY: all

all: clean local_env build_wheel push_wheel

clean: clean-build clean-pyc clean-test

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

build_wheel: clean
	echo "Building $(NEXT_VER)"
	$(file >VERSION,$(NEXT_VER))
	python setup.py bdist_wheel --universal

push_wheel: build_wheel
	echo "building wheel"

build_build_env:
	docker build -f Dockerfile.build -t engine-build:latest .

deploy_inside_docker:
	make build_wheel;
	make upload_wheel_to_nexus;

deploy:
	make build_build_env
	docker run engine-build:latest make deploy_inside_docker

build_docker:
	docker-compose build shell

shell:
	docker-compose run shell bash
