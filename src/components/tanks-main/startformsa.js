import React, { useEffect, useState } from 'react';
import { BrowserView, MobileView } from 'react-device-detect';

const expanderStyle = {
    margin: '6px 0',
    padding: '2px',
    border: '1px solid #85C1E9'
};

const headerStyle = {
    display: 'flex',
    cursor: 'pointer'
};

const titleStyle = {
    padding: '3px',
    flex: 'none'
};

const spacerStyle = {
    flex: '1'
};

const iconStyle = {
    padding: '3px',
    flex: 'none'
};

const contentStyle = {
    overflow: 'hidden',
    transition: 'all 0.3s'
};

const contentExpandedStyle = {
    ...contentStyle,
    padding: '4px 0',
    border: '1px solid #85C1E9',
    height: 'auto',
    filter: 'opacity(1)'
};

const contentCollapsedStyle = {
    ...contentStyle,
    padding: '0 0',
    border: '1px solid transparent',
    height: '0',
    filter: 'opacity(0)'
};

const Expander = ({ title, children }) => {
    const [expanded, setExpanded] = React.useState(false);
    const handleHeaderClick = () => {
        setExpanded(expanded => !expanded);
    };
    return (
        <div style={expanderStyle}>
            <div style={headerStyle} onClick={handleHeaderClick}>
                <div style={titleStyle}>{title}</div>
                <div style={spacerStyle} />
                <div style={iconStyle}>{expanded ? '🔺' : '🔻'}</div>
            </div>
            <div style={expanded ? contentExpandedStyle : contentCollapsedStyle}>
                {children}
            </div>
        </div>
    );
};
export default function StartFormSA({ Settings }) {
    const [numHumans, setNumHumans] = useState(Settings.numHumans);
    const [numRobots, setNumRobots] = useState(Settings.numRobots);
    const [turretIncrement, setTurretIncrement] = useState(Settings.turretIncrement);
    const [tankSize, setTankSize] = useState(Settings.tankSize);
    const [explosionRadius, setExplosionRadius] = useState(Settings.explosionRadius);
    const [terrainBumps, setTerrainBumps] = useState(Settings.terrainBumps);
    const [steepness, setSteepness] = useState(Settings.steepness);
    const [horizonDepth, setHorizonDepth] = useState(Settings.horizonDepth); 
    const [gravity, setGravity] = useState(Settings.gravity); 
    const [shotDelay, setShotDelay] = useState(Settings.shotDelay);
    const [xBooster, setXBooster] = useState(Settings.xBooster);
    useEffect(() => {
        setNumHumans(numHumans);
        setNumRobots(numRobots);
        setTurretIncrement(turretIncrement);
        setTankSize(tankSize);
        setExplosionRadius(explosionRadius);
        setTerrainBumps(terrainBumps);
        setSteepness(steepness);
        setHorizonDepth(horizonDepth);
        setGravity(gravity);
        setShotDelay(shotDelay);
        setXBooster(xBooster);
    }, [numHumans, numRobots, turretIncrement, tankSize, explosionRadius, terrainBumps, steepness, horizonDepth, gravity, shotDelay, xBooster])
    const handleChange=(event)=>{
        const value =  event.target.value;
        const name = event.target.name;

        if (name === "numHumans") {
            setNumHumans(Number(value))
        }
        if (name === "numRobots") {
            setNumRobots(Number(value))
        }
        if (name === "turretIncrement") {
            setTurretIncrement(Number(value))
        }
        if (name === "tankSize") {
            setTankSize(Number(value))
        }
        if (name === "explosionRadius") {
            setExplosionRadius(Number(value))
        }
        if (name === "terrainBumps") {
            setTerrainBumps(Number(value))
        }
        if (name === "steepness") {
            setSteepness(Number(value))
        }
        if (name === "horizonDepth") {
            setHorizonDepth(Number(value))
        }
        if (name === "gravity") {
            setGravity(Number(value))
        }
        if (name === "shotDelay") {
            setShotDelay(Number(value))
        }
        if (name === "xBooster") {
            setXBooster(Number(value))
        }
    }

    const handleSubmit=(event) => {
        event.preventDefault();
        localStorage.setItem(
            'Settings', JSON.stringify({
                numHumans: numHumans,
                numRobots: numRobots,
                turretIncrement: turretIncrement,
                tankSize: tankSize,
                explosionRadius: explosionRadius,
                terrainBumps: terrainBumps,
                steepness: steepness,
                horizonDepth: horizonDepth,
                gravity: gravity,
                shotDelay: shotDelay,
                xBooster: xBooster
            }));
    }
    

    return (<div>
        <BrowserView>
            <Expander title={"SA Settings"}>
                <form onSubmit={handleSubmit}>
                    <label>
                        Number of Humans
                        <input type="text" name="numHumans" value={numHumans} onChange={handleChange} />
                    </label>
                    <label>
                        Number of Robots
                        <input type="text" name="numRobots" value={numRobots} onChange={handleChange} />
                    </label>
                    <label>
                        Turret Increment
                        <input type="text" name="turretIncrement" value={turretIncrement} onChange={handleChange}/>
                    </label>
                    <label>
                        Tank Size
                        <input type="text" name="tankSize" value={tankSize} onChange={handleChange}/>
                    </label>
                    <label>
                        Explosion Radius
                        <input type="text" name="explosionRadius" value={explosionRadius} onChange={handleChange}/>
                    </label>
                    <label>
                        Terrain Bumps
                        <input type="text" name="terrainBumps" value={terrainBumps} onChange={handleChange} />
                    </label>
                    <label>
                         Steepness
                        <input type="text" name="steepness" value={steepness} onChange={handleChange}/>
                    </label>
                    <label>
                        Horizon Depth
                        <input type="text" name="horizonDepth" value={horizonDepth} onChange={handleChange}/>
                    </label>
                    <label>
                        Gravity
                        <input type="text" name="gravity" value={gravity} onChange={handleChange}/>
                    </label>
                    <label>
                        Shot Delay
                        <input type="text" name="shotDelay" value={shotDelay} onChange={handleChange}/>
                    </label>
                    <label>
                        xBooster
                        <input type="text" name="xBooster" value={xBooster} onChange={handleChange}/>
                    </label>
                    <input type="submit" value="Save Settings LS" />
                </form>
            </Expander>
        </BrowserView>
         <MobileView>
            <Expander title={"SA Settings"}>
                <form onSubmit={handleSubmit}>
                    <label>
                        Number of Humans
                        <input type="text" name="numHumans" value={numHumans} onChange={handleChange} />
                    </label>
                    <label>
                        Number of Robots
                        <input type="text" name="numRobots" value={numRobots} onChange={handleChange} />
                    </label>
                    <label>
                        Turret Increment
                        <input type="text" name="turretIncrement" value={turretIncrement} onChange={handleChange} />
                    </label>
                    <label>
                        Tank Size
                        <input type="text" name="tankSize" value={tankSize} onChange={handleChange} />
                    </label>
                    <label>
                        Explosion Radius
                        <input type="text" name="explosionRadius" value={explosionRadius} onChange={handleChange} />
                    </label>
                    <label>
                        Terrain Bumps
                        <input type="text" name="terrainBumps" value={terrainBumps} onChange={handleChange} />
                    </label>
                    <label>
                        Steepness
                        <input type="text" name="steepness" value={steepness} onChange={handleChange} />
                    </label>
                    <label>
                        Horizon Depth
                        <input type="text" name="horizonDepth" value={horizonDepth} onChange={handleChange} />
                    </label>
                    <label>
                        Gravity
                        <input type="text" name="gravity" value={gravity} onChange={handleChange} />
                    </label>
                    <label>
                        Shot Delay
                        <input type="text" name="shotDelay" value={shotDelay} onChange={handleChange} />
                    </label>
                    <label>
                        xBooster
                        <input type="text" name="xBooster" value={xBooster} onChange={handleChange} />
                    </label>
                    <input type="submit" value="Save Settings LS" />
                </form>
            </Expander>
        </MobileView>
    </div>
        );
   
}
