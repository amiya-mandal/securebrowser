module.exports = function(grunt) {

    var package = require("./package.json");
    var version = package.version,
        electronVersion = package.electronVersion;

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            scripts: {
                files: ['js/**/*.js', 'main/*.js'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            },
        },

        electron: {
            osxBuild: {
                options: {
                    name: 'webmine2go',
                    dir: __dirname,
                    out: 'dist/app',
                    version: electronVersion,
                    'app-version': version,
                    platform: 'darwin',
                    arch: 'x64',
                    icon: "icon.icos",
                    ignore: 'dist/app',
                    prune: true,
                    overwrite: true,
                    protocols: [{
                        name: "HTTP link",
                        schemes: ["http", "https"]
                    }, {
                        name: "File",
                        schemes: ["file"]
                    }],
                }
            },
            windowsBuild: {
                options: {
                    name: 'webmine2go',
                    dir: __dirname,
                    out: 'dist/app',
                    icon: "icon.ico",
                    version: electronVersion,
                    'app-version': version,
                    platform: 'win32',
                    arch: 'all',
                    ignore: 'dist/app',
                    prune: true,
                    overwrite: true,
                }
            },
            linuxBuild: {
                options: {
                    name: 'webmine2go',
                    dir: __dirname,
                    out: 'dist/app',
                    icon: 'icon.ico',
                    version: electronVersion,
                    'app-version': version,
                    platform: 'linux',
                    arch: 'all',
                    ignore: 'dist/app',
                    prune: true,
                    overwrite: true,
                }
            }
        },
        'electron-installer-debian': {
            options: {
                productName: "webmine2go",
                genericName: "WebMine2Go",
                version: version,
                section: "web",
                //icon: "icons/icon256.png",
                categories: ["Network", "WebBrowser"],
                mimeType: ["x-scheme-handler/http", "x-scheme-handler/https", "text/html"],
                maintainer: "Webmine Team",
                description: "will be back",
                depends: [
                    'gconf2',
                    'gconf-service',
                    'gvfs-bin',
                    'libc6',
                    'libcap2',
                    'libgtk2.0-0',
                    'libudev0 | libudev1',
                    'libgcrypt11 | libgcrypt20',
                    'libnotify4',
                    'libnss3',
                    'libxtst6',
                    'python',
                    'xdg-utils'
                ]
            },
            linux32: {
                options: {
                    arch: 'i386'
                },
                src: 'dist/app/min-linux-ia32',
                dest: 'dist/app/linux'
            },
            linux64: {
                options: {
                    arch: 'amd64'
                },
                src: 'dist/app/min-linux-x64',
                dest: 'dist/app/linux'
            }
        }
    });

    grunt.loadNpmTasks('grunt-electron');
    grunt.loadNpmTasks('grunt-electron-installer-debian');
    grunt.loadNpmTasks('grunt-contrib-watch')

    grunt.registerTask('default', []);

    grunt.registerTask('macBuild', ['electron:osxBuild'])
    grunt.registerTask('linuxBuild', ['electron:linuxBuild'])
    grunt.registerTask('windowsBuild', ['electron:windowsBuild'])
};