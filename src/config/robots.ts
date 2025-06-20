export interface RobotImage {
  id: string;
  filename: string;
  name: string;
}

import { RobotCountService, MAX_ASSESSMENT_COUNT } from '@/lib/api-service';

// ============================================================
// 配置区域：可以根据需要修改这些配置
// ============================================================

// 每次评估需要的机器人数量
export const ROBOTS_PER_ASSESSMENT = 5;

// 每个机器人允许的最大评估次数，应与后端设置保持一致
// 注意：此值在后端worker.js和前端api-service.ts中也定义了，修改时需要保持一致
// export const MAX_ASSESSMENT_COUNT = 15; // 直接从api-service.ts导入

// 要保留的机器人ID列表
// 如需修改此列表，只需在此处添加或删除机器人ID
  // 您可以根据需要更新此列表

  const SELECTED_ROBOT_IDS = [
    'robot001', 'robot002', 'robot003', 'robot004', 'robot005', 'robot006', 'robot007',
    'robot008', 'robot009', 'robot010', 'robot011', 'robot012', 'robot014',
    'robot015', 'robot016', 'robot017', 'robot019', 'robot020', 'robot023', 'robot024',
    'robot025', 'robot026', 'robot027', 'robot028', 'robot029', 'robot031', 
    'robot033', 'robot034', 'robot035', 'robot036', 'robot037', 'robot038', 'robot039',
    'robot040', 'robot042', 'robot043', 'robot044', 'robot045', 'robot046', 'robot047',
    'robot048', 'robot049', 'robot050', 'robot051', 'robot053', 'robot054', 'robot055',
    'robot056', 'robot057', 'robot058', 'robot059', 'robot060', 'robot061', 'robot063',
    'robot064', 'robot065', 'robot066', 'robot067', 'robot068', 'robot069', 'robot070',
    'robot071', 'robot072', 'robot073', 'robot074', 'robot075', 'robot076', 'robot077',
    'robot078', 'robot080', 'robot081', 'robot082', 'robot083', 'robot084', 'robot085',
    'robot086', 'robot087', 'robot088', 'robot089', 'robot090', 'robot091', 'robot092',
    'robot093', 'robot094', 'robot096', 'robot097', 'robot098', 'robot099', 'robot100',
    'robot102', 'robot103', 'robot104', 'robot105', 'robot106', 'robot108',
    'robot109', 'robot110', 'robot111', 'robot112', 'robot113', 'robot114', 'robot115',
    'robot117', 'robot118', 'robot121', 'robot124', 'robot125',
    'robot126', 'robot127', 'robot128', 'robot129', 'robot130', 'robot132', 'robot133',
    'robot134', 'robot135', 'robot136', 'robot137', 'robot139', 'robot140', 'robot141',
    'robot142', 'robot143', 'robot144', 'robot145', 'robot146', 'robot147', 'robot148',
    'robot149', 'robot151', 'robot152', 'robot153', 'robot154', 'robot156',
    'robot157', 'robot158', 'robot159', 'robot161', 'robot162', 'robot164', 'robot165',
    'robot166', 'robot167', 'robot168', 'robot169', 'robot170', 'robot171', 'robot172',
    'robot173', 'robot174', 'robot175', 'robot176', 'robot177', 'robot178', 'robot179',
    'robot180', 'robot181', 'robot182', 'robot183', 'robot184', 'robot185', 'robot186',
    'robot187', 'robot188', 'robot189', 'robot190', 'robot191', 'robot192', 'robot193',
    'robot194', 'robot196', 'robot197', 'robot198', 'robot200', 'robot201', 'robot203',
    'robot204', 'robot205', 'robot206', 'robot207', 'robot208', 'robot209', 'robot210',
    'robot211', 'robot212', 'robot213', 'robot214', 'robot215', 'robot216', 'robot217',
    'robot218', 'robot220', 'robot221', 'robot222', 'robot223', 'robot224', 'robot225',
    'robot226', 'robot227', 'robot228', 'robot229', 'robot230', 'robot231', 'robot232',
    'robot233', 'robot234', 'robot235', 'robot236', 'robot237', 'robot238', 'robot239',
    'robot240', 'robot241', 'robot242', 'robot244', 'robot245', 'robot246', 'robot247',
    'robot248', 'robot249', 'robot250', 'robot251'
  ];
 

// ============================================================
// 以下内容通常不需要修改
// ============================================================

// 所有可用的机器人图片
const ALL_ROBOT_IMAGES: RobotImage[] = [
  { id: 'robot001', filename: '/robot-images/1_jia_jia_robot.jpg', name: 'jia-jia-robot' },
  { id: 'robot002', filename: '/robot-images/2_snap_bot.jpg', name: 'snap-bot' },
  { id: 'robot003', filename: '/robot-images/3_lego-robot-1.jpg', name: 'lego-robot-1' },
  { id: 'robot004', filename: '/robot-images/4_lego-robot-2.jpg', name: 'lego-robot-2' },
  { id: 'robot005', filename: '/robot-images/5_mini.jpg', name: 'mini' },
  { id: 'robot006', filename: '/robot-images/6_cb2-humanoid.jpg', name: 'cb2-humanoid' },
  { id: 'robot007', filename: '/robot-images/7_alter-humanoid.jpg', name: 'alter-humanoid' },
  { id: 'robot008', filename: '/robot-images/8_jibo.jpg', name: 'jibo' },
  { id: 'robot009', filename: '/robot-images/9_buddy.jpg', name: 'buddy' },
  { id: 'robot010', filename: '/robot-images/10_asimo-humanoid.jpg', name: 'asimo-humanoid' },
  { id: 'robot011', filename: '/robot-images/11_nao-humanoid.jpg', name: 'nao-humanoid' },
  { id: 'robot012', filename: '/robot-images/12_baxter-industrial.jpg', name: 'baxter-industrial' },
  { id: 'robot013', filename: '/robot-images/13_riba-ii.jpg', name: 'riba-ii' },
  { id: 'robot014', filename: '/robot-images/14_altair-ez2.jpg', name: 'altair-ez2' },
  { id: 'robot015', filename: '/robot-images/15_aimec.jpg', name: 'aimec' },
  { id: 'robot016', filename: '/robot-images/16_zenbo.jpg', name: 'zenbo' },
  { id: 'robot017', filename: '/robot-images/17_kirobo.jpg', name: 'kirobo' },
  { id: 'robot018', filename: '/robot-images/18_aldebaran-pepper.jpg', name: 'aldebaran-pepper' },
  { id: 'robot019', filename: '/robot-images/19_romeo.jpg', name: 'romeo' },
  { id: 'robot020', filename: '/robot-images/20_aida-driving-agent.jpg', name: 'aida-driving-agent' },
  { id: 'robot021', filename: '/robot-images/21_darwin-op.jpg', name: 'darwin-op' },
  { id: 'robot022', filename: '/robot-images/22_mobiserv-companion.jpg', name: 'mobiserv-companion' },
  { id: 'robot023', filename: '/robot-images/23_robonaut.jpg', name: 'robonaut' },
  { id: 'robot024', filename: '/robot-images/24_zeno.jpg', name: 'zeno' },
  { id: 'robot025', filename: '/robot-images/25_han.jpg', name: 'han' },
  { id: 'robot026', filename: '/robot-images/26_albert-hubo.jpg', name: 'albert-hubo' },
  { id: 'robot027', filename: '/robot-images/27_poppy.jpg', name: 'poppy' },
  { id: 'robot028', filename: '/robot-images/28_telenoid.jpg', name: 'telenoid' },
  { id: 'robot029', filename: '/robot-images/29_topio.jpg', name: 'topio' },
  { id: 'robot030', filename: '/robot-images/30_discorobo.jpg', name: 'discorobo' },
  { id: 'robot031', filename: '/robot-images/31_inmoov.jpg', name: 'inmoov' },
  { id: 'robot032', filename: '/robot-images/32_kismet.jpg', name: 'kismet' },
  { id: 'robot033', filename: '/robot-images/33_nexi.jpg', name: 'nexi' },
  { id: 'robot034', filename: '/robot-images/34_pino.jpg', name: 'pino' },
  { id: 'robot035', filename: '/robot-images/35_valkyrie.jpg', name: 'valkyrie' },
  { id: 'robot036', filename: '/robot-images/36_atlas.jpg', name: 'atlas' },
  { id: 'robot037', filename: '/robot-images/37_mertz.jpg', name: 'mertz' },
  { id: 'robot038', filename: '/robot-images/38_eccerobot.jpg', name: 'eccerobot' },
  { id: 'robot039', filename: '/robot-images/39_hiro.jpg', name: 'hiro' },
  { id: 'robot040', filename: '/robot-images/40_pr2.jpg', name: 'pr2' },
  { id: 'robot041', filename: '/robot-images/41_MiRAE.jpg', name: 'MiRAE' },
  { id: 'robot042', filename: '/robot-images/42_mip2.jpg', name: 'mip2' },
  { id: 'robot043', filename: '/robot-images/43_iCat.jpg', name: 'iCat' },
  { id: 'robot044', filename: '/robot-images/44_tico.jpg', name: 'tico' },
  { id: 'robot045', filename: '/robot-images/45_sota.jpg', name: 'sota' },
  { id: 'robot046', filename: '/robot-images/46_domo.jpg', name: 'domo' },
  { id: 'robot047', filename: '/robot-images/47_furhat.jpg', name: 'furhat' },
  { id: 'robot048', filename: '/robot-images/48_muu.jpg', name: 'muu' },
  { id: 'robot049', filename: '/robot-images/49_Emuu.jpg', name: 'Emuu' },
  { id: 'robot050', filename: '/robot-images/50_maggie.jpg', name: 'maggie' },
  { id: 'robot051', filename: '/robot-images/51_robothespian.jpg', name: 'robothespian' },
  { id: 'robot052', filename: '/robot-images/52_aryan.jpg', name: 'aryan' },
  { id: 'robot053', filename: '/robot-images/53_emys.jpg', name: 'emys' },
  { id: 'robot054', filename: '/robot-images/54_qrio.jpg', name: 'qrio' },
  { id: 'robot055', filename: '/robot-images/55_irobi-q.jpg', name: 'irobi-q' },
  { id: 'robot056', filename: '/robot-images/56_papero.jpg', name: 'papero' },
  { id: 'robot057', filename: '/robot-images/57_iCub.jpg', name: 'iCub' },
  { id: 'robot058', filename: '/robot-images/58_Genie.jpg', name: 'Genie' },
  { id: 'robot059', filename: '/robot-images/59_Anette.jpg', name: 'Anette' },
  { id: 'robot060', filename: '/robot-images/60_Echo-Plus.jpg', name: 'Echo-Plus' },
  { id: 'robot061', filename: '/robot-images/61_BINA48.jpg', name: 'BINA48' },
  { id: 'robot062', filename: '/robot-images/62_Sophia.jpg', name: 'Sophia' },
  { id: 'robot063', filename: '/robot-images/63_Igus.jpg', name: 'Igus' },
  { id: 'robot064', filename: '/robot-images/64_Cosero.jpg', name: 'Cosero' },
  { id: 'robot065', filename: '/robot-images/65_Flobi.jpg', name: 'Flobi' },
  { id: 'robot066', filename: '/robot-images/66_TJ-Bot.jpg', name: 'TJ-Bot' },
  { id: 'robot067', filename: '/robot-images/67_DURUS.jpg', name: 'DURUS' },
  { id: 'robot068', filename: '/robot-images/68_SociBot-mini.jpg', name: 'SociBot-mini' },
  { id: 'robot069', filename: '/robot-images/69_SociBot-Kiosk.jpg', name: 'SociBot-Kiosk' },
  { id: 'robot070', filename: '/robot-images/70_Cozmo.jpg', name: 'Cozmo' },
  { id: 'robot071', filename: '/robot-images/71_GoCart.jpg', name: 'GoCart' },
  { id: 'robot072', filename: '/robot-images/72_Jimmy.jpg', name: 'Jimmy' },
  { id: 'robot073', filename: '/robot-images/73_HRP-2VZ.jpg', name: 'HRP-2VZ' },
  { id: 'robot074', filename: '/robot-images/74_Kuri.jpg', name: 'Kuri' },
  { id: 'robot075', filename: '/robot-images/75_Big-i.jpg', name: 'Big-i' },
  { id: 'robot076', filename: '/robot-images/76_murata-girl.jpg', name: 'murata-girl' },
  { id: 'robot077', filename: '/robot-images/77_TALOS.jpg', name: 'TALOS' },
  { id: 'robot078', filename: '/robot-images/78_TIAGo.jpg', name: 'TIAGo' },
  { id: 'robot079', filename: '/robot-images/79_REEM.jpg', name: 'REEM' },
  { id: 'robot080', filename: '/robot-images/80_REEM-C-2.jpg', name: 'REEM-C-2' },
  { id: 'robot081', filename: '/robot-images/81_Robovie-mR2.jpg', name: 'Robovie-mR2' },
  { id: 'robot082', filename: '/robot-images/82_Franka-Emika.jpg', name: 'Franka-Emika' },
  { id: 'robot083', filename: '/robot-images/83_Sawyer.jpg', name: 'Sawyer' },
  { id: 'robot084', filename: '/robot-images/84_hub.jpg', name: 'hub' },
  { id: 'robot085', filename: '/robot-images/85_Mykie.jpg', name: 'Mykie' },
  { id: 'robot086', filename: '/robot-images/86_Talk-Torque.jpg', name: 'Talk-Torque' },
  { id: 'robot087', filename: '/robot-images/87_Animated-SmartPhone-1.jpg', name: 'Animated-SmartPhone-1' },
  { id: 'robot088', filename: '/robot-images/88_manoi-pf01.jpg', name: 'manoi-pf01' },
  { id: 'robot089', filename: '/robot-images/89_Gemini.jpg', name: 'Gemini' },
  { id: 'robot090', filename: '/robot-images/90_manoi-AT01.jpg', name: 'manoi-AT01' },
  { id: 'robot091', filename: '/robot-images/91_HRP-4.jpg', name: 'HRP-4' },
  { id: 'robot092', filename: '/robot-images/92_Kobian-1.jpg', name: 'Kobian-1' },
  { id: 'robot093', filename: '/robot-images/93_Hitachi-Emiew.jpg', name: 'Hitachi-Emiew' },
  { id: 'robot094', filename: '/robot-images/94_MILLENNIA.jpg', name: 'MILLENNIA' },
  { id: 'robot095', filename: '/robot-images/95_JD-Humanoid.jpg', name: 'JD-Humanoid' },
  { id: 'robot096', filename: '/robot-images/96_Felix.jpg', name: 'Felix' },
  { id: 'robot097', filename: '/robot-images/97_Flash.jpg', name: 'Flash' },
  { id: 'robot098', filename: '/robot-images/98_Personal-Robot.jpg', name: 'Personal-Robot' },
  { id: 'robot099', filename: '/robot-images/99_AnyBot.jpg', name: 'AnyBot' },
  { id: 'robot100', filename: '/robot-images/100_H5.jpg', name: 'H5' },
  { id: 'robot101', filename: '/robot-images/101_HOSPI-Rimo.jpg', name: 'HOSPI-Rimo' },
  { id: 'robot102', filename: '/robot-images/102_Nextage.jpg', name: 'Nextage' },
  { id: 'robot103', filename: '/robot-images/103_DRU.jpg', name: 'DRU' },
  { id: 'robot104', filename: '/robot-images/104_S-one.jpg', name: 'S-one' },
  { id: 'robot105', filename: '/robot-images/105_Surena-III.jpg', name: 'Surena-III' },
  { id: 'robot106', filename: '/robot-images/106_AcYut-7.jpg', name: 'AcYut-7' },
  { id: 'robot107', filename: '/robot-images/107_Aila.jpg', name: 'Aila' },
  { id: 'robot108', filename: '/robot-images/108_Ami.jpg', name: 'Ami' },
  { id: 'robot109', filename: '/robot-images/109_MoRO.jpg', name: 'MoRO' },
  { id: 'robot110', filename: '/robot-images/110_Ewya.jpg', name: 'Ewya' },
  { id: 'robot111', filename: '/robot-images/111_5e-Nanny-Bot.jpg', name: '5e-Nanny-Bot' },
  { id: 'robot112', filename: '/robot-images/112_Leka.jpg', name: 'Leka' },
  { id: 'robot113', filename: '/robot-images/113_Cuti.jpg', name: 'Cuti' },
  { id: 'robot114', filename: '/robot-images/114_Heasy.jpg', name: 'Heasy' },
  { id: 'robot115', filename: '/robot-images/115_Yumi-TrueSmart.jpg', name: 'Yumi-TrueSmart' },
  { id: 'robot116', filename: '/robot-images/116_Tapia.jpg', name: 'Tapia' },
  { id: 'robot117', filename: '/robot-images/117_Posy.jpg', name: 'Posy' },
  { id: 'robot118', filename: '/robot-images/118_Furo-S.jpg', name: 'Furo-S' },
  { id: 'robot119', filename: '/robot-images/119_Furo-i-Home.jpg', name: 'Furo-i-Home' },
  { id: 'robot120', filename: '/robot-images/120_Jimmy.jpg', name: 'Jimmy' },
  { id: 'robot121', filename: '/robot-images/121_Mung.jpg', name: 'Mung' },
  { id: 'robot122', filename: '/robot-images/122_Mabu.jpg', name: 'Mabu' },
  { id: 'robot123', filename: '/robot-images/123_Mitra.jpg', name: 'Mitra' },
  { id: 'robot124', filename: '/robot-images/124_quori.jpg', name: 'quori' },
  { id: 'robot125', filename: '/robot-images/125_Babyloid.jpg', name: 'Babyloid' },
  { id: 'robot126', filename: '/robot-images/126_Ira.jpg', name: 'Ira' },
  { id: 'robot127', filename: '/robot-images/127_Cassie.jpg', name: 'Cassie' },
  { id: 'robot128', filename: '/robot-images/128_R3-1.jpg', name: 'R3-1' },
  { id: 'robot129', filename: '/robot-images/129_Troy2.jpg', name: 'Troy2' },
  { id: 'robot130', filename: '/robot-images/130_Bandit.jpg', name: 'Bandit' },
  { id: 'robot131', filename: '/robot-images/131_sparki.jpg', name: 'sparki' },
  { id: 'robot132', filename: '/robot-images/132_Maki.jpg', name: 'Maki' },
  { id: 'robot133', filename: '/robot-images/133_HomeMate.jpg', name: 'HomeMate' },
  { id: 'robot134', filename: '/robot-images/134_eyePi.jpg', name: 'eyePi' },
  { id: 'robot135', filename: '/robot-images/135_reeti.jpg', name: 'reeti' },
  { id: 'robot136', filename: '/robot-images/136_Hitchbot.jpg', name: 'Hitchbot' },
  { id: 'robot137', filename: '/robot-images/137_Roboware-E3.jpg', name: 'Roboware-E3' },
  { id: 'robot138', filename: '/robot-images/138_Reddy.jpg', name: 'Reddy' },
  { id: 'robot139', filename: '/robot-images/139_Autom.jpg', name: 'Autom' },
  { id: 'robot140', filename: '/robot-images/140_Snackbot.jpg', name: 'Snackbot' },
  { id: 'robot141', filename: '/robot-images/141_Amigo.jpg', name: 'Amigo' },
  { id: 'robot142', filename: '/robot-images/142_Hermes.jpg', name: 'Hermes' },
  { id: 'robot143', filename: '/robot-images/143_ARMAR-3.jpg', name: 'ARMAR-3' },
  { id: 'robot144', filename: '/robot-images/144_loomo.jpg', name: 'loomo' },
  { id: 'robot145', filename: '/robot-images/145_Eva.jpg', name: 'Eva' },
  { id: 'robot146', filename: '/robot-images/146_Robohon.jpg', name: 'Robohon' },
  { id: 'robot147', filename: '/robot-images/147_Meka-1.jpg', name: 'Meka-1' },
  { id: 'robot148', filename: '/robot-images/148_Cody.jpg', name: 'Cody' },
  { id: 'robot149', filename: '/robot-images/149_TellUBee.jpg', name: 'TellUBee' },
  { id: 'robot150', filename: '/robot-images/150_Milo.jpg', name: 'Milo' },
  { id: 'robot151', filename: '/robot-images/151_Topio-Dio.jpg', name: 'Topio-Dio' },
  { id: 'robot152', filename: '/robot-images/152_Twendy-One.jpg', name: 'Twendy-One' },
  { id: 'robot153', filename: '/robot-images/153_Wakamaru.jpg', name: 'Wakamaru' },
  { id: 'robot154', filename: '/robot-images/154_HERB.jpg', name: 'HERB' },
  { id: 'robot155', filename: '/robot-images/155_E-Nuvo.jpg', name: 'E-Nuvo' },
  { id: 'robot156', filename: '/robot-images/156_Robina.jpg', name: 'Robina' },
  { id: 'robot157', filename: '/robot-images/157_Humanoid-2.jpg', name: 'Humanoid-2' },
  { id: 'robot158', filename: '/robot-images/158_Mahru.jpg', name: 'Mahru' },
  { id: 'robot159', filename: '/robot-images/159_Manav.jpg', name: 'Manav' },
  { id: 'robot160', filename: '/robot-images/160_musio.jpg', name: 'musio' },
  { id: 'robot161', filename: '/robot-images/161_Roboy.jpg', name: 'Roboy' },
  { id: 'robot162', filename: '/robot-images/162_Hoap-3.jpg', name: 'Hoap-3' },
  { id: 'robot163', filename: '/robot-images/163_Rolling-Justin.jpg', name: 'Rolling-Justin' },
  { id: 'robot164', filename: '/robot-images/164_Aido-1.jpg', name: 'Aido-1' },
  { id: 'robot165', filename: '/robot-images/165_Roboray.jpg', name: 'Roboray' },
  { id: 'robot166', filename: '/robot-images/166_Ciros.jpg', name: 'Ciros' },
  { id: 'robot167', filename: '/robot-images/167_Kibo.jpg', name: 'Kibo' },
  { id: 'robot168', filename: '/robot-images/168_Silbot-3.jpg', name: 'Silbot-3' },
  { id: 'robot169', filename: '/robot-images/169_Sociable-Trashbox.jpg', name: 'Sociable-Trashbox' },
  { id: 'robot170', filename: '/robot-images/170_Ethon2.jpg', name: 'Ethon2' },
  { id: 'robot171', filename: '/robot-images/171_Mero.jpg', name: 'Mero' },
  { id: 'robot172', filename: '/robot-images/172_qihan-sanbot.jpg', name: 'qihan-sanbot' },
  { id: 'robot173', filename: '/robot-images/173_UR3.jpg', name: 'UR3' },
  { id: 'robot174', filename: '/robot-images/174_PadBot.jpg', name: 'PadBot' },
  { id: 'robot175', filename: '/robot-images/175_Luna.jpg', name: 'Luna' },
  { id: 'robot176', filename: '/robot-images/176_sphero.jpg', name: 'sphero' },
  { id: 'robot177', filename: '/robot-images/177_Ollie.jpg', name: 'Ollie' },
  { id: 'robot178', filename: '/robot-images/178_Meccano-MeccaNoid.jpg', name: 'Meccano-MeccaNoid' },
  { id: 'robot179', filename: '/robot-images/179_tipron.jpg', name: 'tipron' },
  { id: 'robot180', filename: '/robot-images/180_Lego-boost.jpg', name: 'Lego-boost' },
  { id: 'robot181', filename: '/robot-images/181_Keecker.jpg', name: 'Keecker' },
  { id: 'robot182', filename: '/robot-images/182_Clocky.jpg', name: 'Clocky' },
  { id: 'robot183', filename: '/robot-images/183_ARM-S.jpg', name: 'ARM-S' },
  { id: 'robot184', filename: '/robot-images/184_Aero-Drc.jpg', name: 'Aero-Drc' },
  { id: 'robot185', filename: '/robot-images/185_HRP2+.jpg', name: 'HRP2+' },
  { id: 'robot186', filename: '/robot-images/186_Metal-Rebel.jpg', name: 'Metal-Rebel' },
  { id: 'robot187', filename: '/robot-images/187_THOR.jpg', name: 'THOR' },
  { id: 'robot188', filename: '/robot-images/188_DRC-Hubo.jpg', name: 'DRC-Hubo' },
  { id: 'robot189', filename: '/robot-images/189_Xing-Tian.jpg', name: 'Xing-Tian' },
  { id: 'robot190', filename: '/robot-images/190_Running-Man.jpg', name: 'Running-Man' },
  { id: 'robot191', filename: '/robot-images/191_HRP2-Promet.jpg', name: 'HRP2-Promet' },
  { id: 'robot192', filename: '/robot-images/192_Johnny-Five.jpg', name: 'Johnny-Five' },
  { id: 'robot193', filename: '/robot-images/193_Walk-Man.jpg', name: 'Walk-Man' },
  { id: 'robot194', filename: '/robot-images/194_Escher.jpg', name: 'Escher' },
  { id: 'robot195', filename: '/robot-images/195_Kodomoroid.jpg', name: 'Kodomoroid' },
  { id: 'robot196', filename: '/robot-images/196_Ontonaroid.jpg', name: 'Ontonaroid' },
  { id: 'robot197', filename: '/robot-images/197_Erica.jpg', name: 'Erica' },
  { id: 'robot198', filename: '/robot-images/198_Geminoid-H1-4.jpg', name: 'Geminoid-H1-4' },
  { id: 'robot199', filename: '/robot-images/199_Int-Ball.jpg', name: 'Int-Ball' },
  { id: 'robot200', filename: '/robot-images/200_Surena-Mini.jpg', name: 'Surena-Mini' },
  { id: 'robot201', filename: '/robot-images/201_pris.jpg', name: 'pris' },
  { id: 'robot202', filename: '/robot-images/202_speech_buddy.jpg', name: 'speech-buddy' },
  { id: 'robot203', filename: '/robot-images/203_geebot.jpg', name: 'geebot' },
  { id: 'robot204', filename: '/robot-images/204_chico.jpg', name: 'chico' },
  { id: 'robot205', filename: '/robot-images/205_kaspar.jpg', name: 'kaspar' },
  { id: 'robot206', filename: '/robot-images/206_pillo.jpg', name: 'pillo' },
  { id: 'robot207', filename: '/robot-images/207_otto.jpg', name: 'otto' },
  { id: 'robot208', filename: '/robot-images/208_ipal.jpg', name: 'ipal' },
  { id: 'robot209', filename: '/robot-images/209_commu.jpg', name: 'commu' },
  { id: 'robot210', filename: '/robot-images/210_platina.jpg', name: 'platina' },
  { id: 'robot211', filename: '/robot-images/211_Ibuki.jpg', name: 'Ibuki' },
  { id: 'robot212', filename: '/robot-images/212_synchy.jpg', name: 'synchy' },
  { id: 'robot213', filename: '/robot-images/213_slate.jpg', name: 'slate' },
  { id: 'robot214', filename: '/robot-images/214_qtrobot.jpg', name: 'qtrobot' },
  { id: 'robot215', filename: '/robot-images/215_av1.jpg', name: 'av1' },
  { id: 'robot216', filename: '/robot-images/216_hsrmobile.jpg', name: 'hsrmobile' },
  { id: 'robot217', filename: '/robot-images/217_thr3.jpg', name: 'thr3' },
  { id: 'robot218', filename: '/robot-images/218_topo.jpg', name: 'topo' },
  { id: 'robot219', filename: '/robot-images/219_misty.jpg', name: 'misty' },
  { id: 'robot220', filename: '/robot-images/220_aerialbipedal.jpg', name: 'aerialbipedal' },
  { id: 'robot221', filename: '/robot-images/221_haru.jpg', name: 'haru' },
  { id: 'robot222', filename: '/robot-images/222_toro.jpg', name: 'toro' },
  { id: 'robot223', filename: '/robot-images/223_moxi.jpg', name: 'moxi' },
  { id: 'robot224', filename: '/robot-images/224_waseda.jpg', name: 'waseda' },
  { id: 'robot225', filename: '/robot-images/225_telexistence.jpg', name: 'telexistence' },
  { id: 'robot226', filename: '/robot-images/226_edgar.jpg', name: 'edgar' },
  { id: 'robot227', filename: '/robot-images/227_airbot.jpg', name: 'airbot' },
  { id: 'robot228', filename: '/robot-images/228_kengoro.jpg', name: 'kengoro' },
  { id: 'robot229', filename: '/robot-images/229_myon.jpg', name: 'myon' },
  { id: 'robot230', filename: '/robot-images/230_centaur.jpg', name: 'centaur' },
  { id: 'robot231', filename: '/robot-images/231_3e_a18.jpg', name: '3e-a18' },
  { id: 'robot232', filename: '/robot-images/232_3e_c18.jpg', name: '3e-c18' },
  { id: 'robot233', filename: '/robot-images/233_aeolus.jpg', name: 'aeolus' },
  { id: 'robot234', filename: '/robot-images/234_walker.jpg', name: 'walker' },
  { id: 'robot235', filename: '/robot-images/235_lynx.jpg', name: 'lynx' },
  { id: 'robot236', filename: '/robot-images/236_cruzr.jpg', name: 'cruzr' },
  { id: 'robot237', filename: '/robot-images/237_sanbot_max.jpg', name: 'sanbot-max' },
  { id: 'robot238', filename: '/robot-images/238_sanbot_nano.jpg', name: 'sanbot-nano' },
  { id: 'robot239', filename: '/robot-images/239_nadine.jpg', name: 'nadine' },
  { id: 'robot240', filename: '/robot-images/240_padbot3.jpg', name: 'padbot3' },
  { id: 'robot241', filename: '/robot-images/241_stevie.jpg', name: 'stevie' },
  { id: 'robot242', filename: '/robot-images/242_gazeroid.jpg', name: 'gazeroid' },
  { id: 'robot243', filename: '/robot-images/243_jackrabbit2.jpg', name: 'jackrabbit2' },
  { id: 'robot244', filename: '/robot-images/244_seer.jpg', name: 'seer' },
  { id: 'robot245', filename: '/robot-images/245_yumi.jpg', name: 'yumi' },
  { id: 'robot246', filename: '/robot-images/246_adata.jpg', name: 'adata' },
  { id: 'robot247', filename: '/robot-images/247_careobot.jpg', name: 'careobot' },
  { id: 'robot248', filename: '/robot-images/248_charli.jpg', name: 'charli' },
  { id: 'robot249', filename: '/robot-images/249_ibotn.jpg', name: 'ibotn' },
  { id: 'robot250', filename: '/robot-images/250_kojiro.jpg', name: 'kojiro' },
  { id: 'robot251', filename: '/robot-images/251_olivia.jpg', name: 'olivia' }
];

// 从所有机器人中过滤出指定ID的机器人
export const ROBOT_IMAGES: RobotImage[] = ALL_ROBOT_IMAGES.filter(robot => 
  SELECTED_ROBOT_IDS.includes(robot.id)
);

// 随机选择指定数量的机器人，从所有未达到评估上限的机器人中完全随机抽取
export async function getRandomRobotsWithCounts(count: number = ROBOTS_PER_ASSESSMENT): Promise<RobotImage[]> {
  try {
    // 获取所有机器人的评估次数
    const robotCounts = await RobotCountService.getRobotCounts();
    
    // 所有选定的机器人列表
    const allSelectedRobots = [...ROBOT_IMAGES];
    
    // 过滤出所有评估次数低于上限的机器人
    // 如果一个机器人从未被评估过，在robotCounts中就不存在记录，应该被包含在可选列表中
    const availableRobots = allSelectedRobots.filter(robot => 
      !robotCounts[robot.id] || robotCounts[robot.id] < MAX_ASSESSMENT_COUNT
    );
    
    // 如果没有可用机器人，使用所有机器人
    if (availableRobots.length === 0) {
      console.warn('没有可用的机器人，将使用全部机器人池');
      return getRandomRobots(count);
    }
    
    // 确保不要尝试选择比可用机器人更多的数量
    const selectCount = Math.min(count, availableRobots.length);
    
    // 复制数组防止修改原数组
    const shuffled = [...availableRobots];
    
    // Fisher-Yates 随机算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // 返回前selectCount个元素
    return shuffled.slice(0, selectCount);
    
  } catch (error) {
    console.error('获取随机机器人失败，使用本地随机选择:', error);
    // 发生错误时回退到原始的随机选择
    return getRandomRobots(count);
  }
}

// 保留原始的同步随机选择函数，作为备选
export function getRandomRobots(count: number = ROBOTS_PER_ASSESSMENT): RobotImage[] {
  // 确保不要尝试选择比可用机器人更多的数量
  const selectCount = Math.min(count, ROBOT_IMAGES.length);
  
  // 复制数组防止修改原数组
  const shuffled = [...ROBOT_IMAGES];
  
  // Fisher-Yates 随机算法
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // 返回前selectCount个元素
  return shuffled.slice(0, selectCount);
}