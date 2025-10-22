package com.example.strongify.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = StrongPrimary,
    secondary = StrongSecondary,
    background = StrongBackground,
    surface = StrongSurface,
    onPrimary = StrongTextPrimary,
    onSecondary = StrongTextPrimary,
    onBackground = StrongTextPrimary,
    onSurface = StrongTextPrimary,
)

private val LightColorScheme = lightColorScheme(
    primary = StrongSecondary,
    secondary = StrongAccent,
    background = Color(0xFFF5F5F5),
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.Black,
    onBackground = Color.Black,
    onSurface = Color.Black,
)

@Composable
fun StrongifyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colors,
        typography = StrongifyTypography,
        content = content
    )
}
