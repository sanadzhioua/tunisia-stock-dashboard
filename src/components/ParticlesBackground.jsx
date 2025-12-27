import { useCallback, useMemo } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

function ParticlesBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine)
    }, [])

    const options = useMemo(() => ({
        background: {
            color: {
                value: 'transparent'
            }
        },
        fpsLimit: 60,
        particles: {
            color: {
                value: ['#00f5ff', '#ff00ff', '#bf00ff']
            },
            links: {
                color: '#00f5ff',
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1
            },
            move: {
                direction: 'none',
                enable: true,
                outModes: {
                    default: 'bounce'
                },
                random: true,
                speed: 0.5,
                straight: false
            },
            number: {
                density: {
                    enable: true,
                    area: 1000
                },
                value: 40
            },
            opacity: {
                value: { min: 0.1, max: 0.4 },
                animation: {
                    enable: true,
                    speed: 0.5,
                    minimumValue: 0.1
                }
            },
            shape: {
                type: 'circle'
            },
            size: {
                value: { min: 1, max: 3 }
            }
        },
        detectRetina: true,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: 'grab'
                },
                onClick: {
                    enable: true,
                    mode: 'push'
                }
            },
            modes: {
                grab: {
                    distance: 140,
                    links: {
                        opacity: 0.5,
                        color: '#ff00ff'
                    }
                },
                push: {
                    quantity: 2
                }
            }
        }
    }), [])

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={options}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    )
}

export default ParticlesBackground
