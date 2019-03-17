module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                'appId': 'me.curtiss.piguardian',
                'productName': 'Pi Guardian',
                'linux': {
                    'target': [
                        {
                            'target': 'AppImage',
                            'arch': ['armv7l']
                        }
                    ]
                }
            }
        }
    }
};
