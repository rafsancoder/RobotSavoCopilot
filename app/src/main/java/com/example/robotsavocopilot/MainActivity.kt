package com.example.robotsavocopilot

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.robotsavocopilot.ui.theme.RobotSavoCopilotTheme
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RobotSavoCopilotTheme {
                RobotSavoApp()
            }
        }
    }
}

@Composable
fun RobotSavoApp() {
    val navController = rememberNavController()

    Scaffold { paddingValues ->
        NavGraph(
            navController = navController,
            modifier = Modifier.padding(paddingValues)
        )
    }
}

@Composable
fun NavGraph(navController: NavHostController, modifier: Modifier = Modifier) {
    NavHost(
        navController = navController,
        startDestination = "home",
        modifier = modifier.fillMaxSize()
    ) {
        composable("home") { HomeScreen(navController) }
        composable("navigation") { NavigationScreen(navController) }
        composable("map") { MapScreen(navController) }
        composable("voice") { VoiceScreen(navController) }
    }
}

/* ------------ HOME SCREEN ------------ */

@Composable
fun HomeScreen(navController: NavHostController) {
    val now = remember { Date() }
    val timeText = remember {
        SimpleDateFormat("HH:mm", Locale.getDefault()).format(now)
    }
    val dateText = remember {
        SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(now)
    }

    var menuExpanded by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Image(
            painter = painterResource(id = R.drawable.robot_home_bg),
            contentDescription = "Savo robot background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xE6000000),
                            Color(0x66000000),
                            Color(0xCC000000)
                        )
                    )
                )
        )

        Card(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth(0.8f)
                .aspectRatio(9f / 16f),
            shape = RoundedCornerShape(32.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0x33000000)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.TopCenter
            ) {
                Text(
                    text = "RobotSavoCopilot",
                    color = Color.White,
                    fontSize = 22.sp
                )
            }
        }

        Column(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .padding(start = 24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ModeIconButton(
                icon = Icons.Filled.Navigation,
                label = "Nav",
                onClick = { navController.navigate("navigation") }
            )
            Spacer(Modifier.height(12.dp))
            ModeIconButton(
                icon = Icons.Filled.Map,
                label = "Map",
                onClick = { navController.navigate("map") }
            )
            Spacer(Modifier.height(12.dp))
            ModeIconButton(
                icon = Icons.Filled.Mic,
                label = "Voice",
                onClick = { navController.navigate("voice") }
            )
            Spacer(Modifier.height(12.dp))
            ModeIconButton(
                icon = Icons.Filled.Tv,
                label = "Display",
                onClick = { /* later */ }
            )
        }

        Row(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Box {
                IconButton(onClick = { menuExpanded = true }) {
                    Icon(
                        imageVector = Icons.Filled.Menu,
                        contentDescription = "Menu",
                        tint = Color.White
                    )
                }

                DropdownMenu(
                    expanded = menuExpanded,
                    onDismissRequest = { menuExpanded = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Home") },
                        onClick = {
                            navController.navigate("home") {
                                popUpTo("home") { inclusive = true }
                            }
                            menuExpanded = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("RobotSavo") },
                        onClick = { menuExpanded = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Documents") },
                        onClick = { menuExpanded = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Settings") },
                        onClick = { menuExpanded = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Help & Resources") },
                        onClick = { menuExpanded = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Logout") },
                        onClick = { menuExpanded = false }
                    )
                }
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "RobotSavoCopilot",
                    color = Color.White,
                    fontSize = 18.sp
                )
                Text(
                    text = dateText,
                    color = Color(0xFFCCCCCC),
                    fontSize = 12.sp
                )
            }

            Text(
                text = timeText,
                color = Color.White,
                fontSize = 14.sp
            )
        }
    }
}

/* ------------ NAVIGATION SCREEN ------------ */

@Composable
fun NavigationScreen(navController: NavHostController) {
    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Image(
            painter = painterResource(id = R.drawable.robot_nav_bg),
            contentDescription = "Navigation background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xCCFFFFFF),
                            Color(0xAAFFFFFF)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(horizontalAlignment = Alignment.Start) {
                Text(
                    text = "Navigation",
                    style = MaterialTheme.typography.headlineMedium,
                    color = Color(0xFF003366)
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Here we will show routes and waypoints for Savo.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF335577)
                )
            }

            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = "• Example route: Lab → Corridor → Lobby",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF003366)
                )
                Text(
                    text = "• Tap + (later) to add new missions.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF003366)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Start
            ) {
                Button(onClick = { navController.popBackStack() }) {
                    Text("Back")
                }
            }
        }
    }
}

/* ------------ MAP SCREEN ------------ */

@Composable
fun MapScreen(navController: NavHostController) {
    val context = LocalContext.current

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Image(
            painter = painterResource(id = R.drawable.robot_nav_bg),
            contentDescription = "Map background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xCC001133),
                            Color(0xAA003366)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                    Text(
                        text = "Map View",
                        style = MaterialTheme.typography.headlineSmall,
                        color = Color.White
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            Text(
                text = "See Savo's environment on a live map.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFFB0CFFF)
            )

            Spacer(modifier = Modifier.weight(1f))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0x66001133)
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Text(
                        text = "Open in Google Maps",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "Tap the button below to open Savo's location in Google Maps.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFFDEE6FF)
                    )
                    Spacer(Modifier.height(16.dp))

                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            val label = "Savonia University"
                            val gmmIntentUri = Uri.parse(
                                "geo:0,0?q=" + Uri.encode(label)
                            )
                            val mapIntent =
                                Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                                    setPackage("com.google.android.apps.maps")
                                }

                            if (mapIntent.resolveActivity(context.packageManager) != null) {
                                context.startActivity(mapIntent)
                            } else {
                                val browserIntent = Intent(
                                    Intent.ACTION_VIEW,
                                    Uri.parse(
                                        "https://www.google.com/maps/search/?api=1&query=" +
                                                Uri.encode(label)
                                    )
                                )
                                context.startActivity(browserIntent)
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Map,
                            contentDescription = "Open Maps"
                        )
                        Spacer(Modifier.width(8.dp))
                        Text("Open Google Maps")
                    }
                }
            }
        }
    }
}

/* ------------ VOICE SCREEN: RECORD, PLAY, DELETE ------------ */

data class VoiceRecording(
    val name: String,
    val path: String
)

@Composable
fun VoiceScreen(navController: NavHostController) {
    val context = LocalContext.current

    var isRecording by remember { mutableStateOf(false) }
    var currentFilePath by remember { mutableStateOf<String?>(null) }
    var recorder by remember { mutableStateOf<MediaRecorder?>(null) }

    var recordings by remember { mutableStateOf<List<VoiceRecording>>(emptyList()) }

    var player by remember { mutableStateOf<MediaPlayer?>(null) }
    var currentlyPlayingPath by remember { mutableStateOf<String?>(null) }

    var hasAudioPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher =
        rememberLauncherForActivityResult(
            contract = ActivityResultContracts.RequestPermission()
        ) { granted ->
            hasAudioPermission = granted
            if (granted) {
                startRecording(
                    context = context,
                    onRecorderReady = { recorder = it },
                    onFileCreated = { currentFilePath = it },
                    onRecordingStateChange = { isRecording = it }
                )
            } else {
                Toast.makeText(context, "Microphone permission denied", Toast.LENGTH_SHORT).show()
            }
        }

    fun getRecordingsDir(): File =
        File(context.filesDir, "recordings").apply { if (!exists()) mkdirs() }

    fun refreshRecordings() {
        val dir = getRecordingsDir()
        val files = dir.listFiles()?.sortedByDescending { it.lastModified() } ?: emptyList()
        recordings = files.map { file ->
            VoiceRecording(
                name = file.nameWithoutExtension,
                path = file.absolutePath
            )
        }
    }

    fun stopRecordingAndRefresh() {
        stopRecording(
            recorder = recorder,
            onRecorderReset = { recorder = null },
            onRecordingStateChange = { isRecording = it }
        )
        if (currentFilePath != null) {
            refreshRecordings()
        }
        currentFilePath = null
    }

    fun stopPlayback() {
        try {
            player?.run {
                try {
                    stop()
                } catch (_: Exception) {
                }
                release()
            }
        } catch (_: Exception) {
        }
        player = null
        currentlyPlayingPath = null
    }

    fun playRecording(path: String) {
        if (currentlyPlayingPath == path) {
            stopPlayback()
            return
        }

        stopPlayback()

        val newPlayer = MediaPlayer()
        try {
            newPlayer.setDataSource(path)
            newPlayer.prepare()
            newPlayer.start()
            currentlyPlayingPath = path
            player = newPlayer

            newPlayer.setOnCompletionListener {
                stopPlayback()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Unable to play recording", Toast.LENGTH_SHORT).show()
            stopPlayback()
        }
    }

    fun deleteRecording(path: String) {
        if (currentlyPlayingPath == path) {
            stopPlayback()
        }
        try {
            File(path).delete()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        refreshRecordings()
    }

    LaunchedEffect(Unit) {
        refreshRecordings()
    }

    DisposableEffect(Unit) {
        onDispose {
            stopPlayback()
        }
    }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Image(
            painter = painterResource(id = R.drawable.robot_home_bg),
            contentDescription = "Voice background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xCC220033),
                            Color(0xAA000000)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                    Text(
                        text = "Voice Commands",
                        style = MaterialTheme.typography.headlineSmall,
                        color = Color.White
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            Text(
                text = "Record sample commands for your robot. You can re-record, " +
                        "play them back, and delete recordings.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFFE0D7FF)
            )

            Spacer(Modifier.height(24.dp))

            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    FilledIconButton(
                        onClick = {
                            if (isRecording) {
                                stopRecordingAndRefresh()
                            } else {
                                if (hasAudioPermission) {
                                    startRecording(
                                        context = context,
                                        onRecorderReady = { recorder = it },
                                        onFileCreated = { currentFilePath = it },
                                        onRecordingStateChange = { isRecording = it }
                                    )
                                } else {
                                    permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                }
                            }
                        },
                        modifier = Modifier.size(80.dp),
                        shape = RoundedCornerShape(40.dp),
                        colors = IconButtonDefaults.filledIconButtonColors(
                            containerColor = if (isRecording) Color(0xFFFF1744) else Color(0xFF6200EE),
                            contentColor = Color.White
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Mic,
                            contentDescription = "Record",
                            modifier = Modifier.size(40.dp)
                        )
                    }

                    Spacer(Modifier.height(8.dp))

                    Text(
                        text = if (isRecording) "Recording… tap to stop" else "Tap to record",
                        color = Color.White
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            Text(
                text = "Saved recordings",
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )

            Spacer(Modifier.height(8.dp))

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x66000000))
            ) {
                if (recordings.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No recordings yet. Start by tapping the mic button.",
                            color = Color(0xFFDDDDDD)
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(recordings) { rec ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xAA1C1C28)
                                )
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text(
                                            text = rec.name,
                                            color = Color.White,
                                            style = MaterialTheme.typography.bodyMedium
                                        )
                                        Text(
                                            text = File(rec.path).length()
                                                .let { "${it / 1024} KB" },
                                            color = Color(0xFFAAAAAA),
                                            fontSize = 11.sp
                                        )
                                    }

                                    Row {
                                        IconButton(onClick = { playRecording(rec.path) }) {
                                            Icon(
                                                imageVector =
                                                    if (currentlyPlayingPath == rec.path)
                                                        Icons.Filled.Stop
                                                    else
                                                        Icons.Filled.PlayArrow,
                                                contentDescription = "Play / Stop",
                                                tint = Color(0xFFBBDEFB)
                                            )
                                        }
                                        IconButton(onClick = { deleteRecording(rec.path) }) {
                                            Icon(
                                                imageVector = Icons.Filled.Delete,
                                                contentDescription = "Delete",
                                                tint = Color(0xFFFFCDD2)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ------------ SIDE BUTTON COMPONENT ------------ */

@Composable
fun ModeIconButton(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        FilledIconButton(
            onClick = onClick,
            modifier = Modifier.size(52.dp),
            shape = RoundedCornerShape(16.dp),
            colors = IconButtonDefaults.filledIconButtonColors(
                containerColor = Color(0x66000000),
                contentColor = Color.White
            )
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label
            )
        }
        Spacer(Modifier.height(4.dp))
        Text(
            text = label,
            color = Color.White,
            fontSize = 12.sp
        )
    }
}

/* ------------ RECORDING HELPERS ------------ */

private fun startRecording(
    context: android.content.Context,
    onRecorderReady: (MediaRecorder) -> Unit,
    onFileCreated: (String) -> Unit,
    onRecordingStateChange: (Boolean) -> Unit
) {
    val recordingsDir = File(context.filesDir, "recordings").apply {
        if (!exists()) mkdirs()
    }
    val fileName = "rec_${System.currentTimeMillis()}.3gp"
    val outputFile = File(recordingsDir, fileName)

    val recorder = MediaRecorder()
    try {
        recorder.setAudioSource(MediaRecorder.AudioSource.MIC)
        recorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
        recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
        recorder.setOutputFile(outputFile.absolutePath)

        recorder.prepare()
        recorder.start()

        onRecorderReady(recorder)
        onFileCreated(outputFile.absolutePath)
        onRecordingStateChange(true)
    } catch (e: Exception) {
        e.printStackTrace()
        try {
            recorder.release()
        } catch (_: Exception) {
        }
        onRecordingStateChange(false)
    }
}

private fun stopRecording(
    recorder: MediaRecorder?,
    onRecorderReset: () -> Unit,
    onRecordingStateChange: (Boolean) -> Unit
) {
    try {
        recorder?.apply {
            try {
                stop()
            } catch (_: Exception) {
            }
            release()
        }
    } catch (e: Exception) {
        e.printStackTrace()
    } finally {
        onRecorderReset()
        onRecordingStateChange(false)
    }
}
