from setuptools import setup, find_packages


with open("./README.md", "r") as fh:
    long_description = fh.read()


with open("./VERSION") as f:
    version = f.read().strip()


with open("requirements.txt", "r") as fh:
    requirements = fh.readlines()


setup(
    install_requires=[req for req in requirements if req[:2] != "# "],
    name="shroomdk",
    version=version,
    author="dev@flipsidecrypto.com",
    author_email="dev@flipsidecrypto.com",
    description="ShroomDK by Flipside Crypto: Query the most comprehensive blockchain data in crypto",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/FlipsideCrypto/sdk/python",
    packages=find_packages(),
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    dependency_links=[],
    python_requires=">=3.6",
)
